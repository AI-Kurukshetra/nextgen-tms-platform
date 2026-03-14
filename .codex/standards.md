# Coding Standards — NextGen TMS Platform
> Codex must read this before writing ANY file. No exceptions.

---

## TYPESCRIPT

- Strict mode always on — tsconfig `"strict": true`
- No `any` type — ever. Use `unknown` + type guards if needed
- No `@ts-ignore` or `@ts-expect-error`
- All function parameters and return types explicitly typed
- Use `type` for object shapes, `interface` for extendable contracts
- Always use Supabase generated types from `@/types/database`

```typescript
// WRONG
const data: any = await supabase.from('shipments').select()
// RIGHT
const { data, error } = await supabase.from('shipments').select('*')
// data is typed via Database generic
```

---

## FILE + FOLDER NAMING

| Thing | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `ShipmentTable.tsx` |
| Files (lib/utils) | camelCase | `shipments.ts` |
| Files (pages) | lowercase | `page.tsx` |
| Folders | kebab-case | `delay-prediction/` |
| Custom hooks | camelCase + use prefix | `useShipments.ts` |
| Server actions | camelCase verbs | `createShipment`, `updateStatus` |
| Zod schemas | camelCase + Schema suffix | `shipmentSchema` |
| Types | PascalCase | `Shipment`, `Carrier` |

---

## COMPONENT RULES

- Server component by default — add `'use client'` only when:
  - Using React hooks (useState, useEffect, etc.)
  - Using browser APIs (window, document)
  - Using event handlers directly on elements
- Never fetch data in client components — use server components + pass as props
- One component per file
- Props interface defined at top of file
- Destructure props in function signature

```typescript
// WRONG — client component doing data fetch
'use client'
export default function ShipmentTable() {
  const [data, setData] = useState([])
  useEffect(() => { fetch('/api/shipments').then(...) }, [])
}

// RIGHT — server component
export default async function ShipmentTable() {
  const shipments = await getShipments()
  return <table>...</table>
}
```

---

## FORMS

- Always use React Hook Form + Zod
- Same Zod schema used for client AND server validation
- Never trust client-side validation alone — always re-validate in server action
- Use `zodResolver` from `@hookform/resolvers/zod`
- Show inline field errors, not alert boxes
- Show toast for success/failure at form level

```typescript
// Validation file: lib/validations/shipment.ts
import { z } from 'zod'

export const createShipmentSchema = z.object({
  origin_city: z.string().min(2, 'Required'),
  destination_city: z.string().min(2, 'Required'),
  weight_kg: z.number().positive('Must be greater than 0'),
  cargo_type: z.enum(['general','perishable','hazardous','fragile','oversized','electronics']),
})

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>
```

---

## SERVER ACTIONS

- All mutations use Server Actions (not API routes, except AI endpoint)
- File location: `src/lib/actions/[module].ts`
- Always return `{ data, error }` shape — never throw
- Always validate with Zod before touching DB
- Always check auth inside the action — do not trust client

```typescript
// src/lib/actions/shipments.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { createShipmentSchema } from '@/lib/validations/shipment'

export async function createShipment(input: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const parsed = createShipmentSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('shipments')
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}
```

---

## STYLING

- Tailwind CSS utility classes only — no inline styles, no CSS modules
- No arbitrary values like `w-[347px]` — use standard scale
- Use `cn()` from `lib/utils.ts` for conditional classes
- shadcn/ui components for all form elements, buttons, dialogs, badges, tables
- Do not modify files inside `src/components/ui/` — these are shadcn managed

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## ERROR HANDLING

- Never show raw error objects or stack traces to users
- Always show user-friendly messages via `sonner` toast
- Server actions return `{ data, error }` — page checks error before rendering
- Use try/catch in API routes — return proper HTTP status codes
- Loading states on every async operation — use Suspense or `isPending` from useTransition

```typescript
// Good error pattern in a page
const { data: shipments, error } = await getShipments()
if (error) return <ErrorState message="Could not load shipments" />
if (!shipments?.length) return <EmptyState />
return <ShipmentTable shipments={shipments} />
```

---

## IMPORTS

- Always use `@/` alias — never relative paths like `../../`
- Group imports: React → Next.js → third-party → internal
- No unused imports — TypeScript strict mode will catch them

---

## DATABASE QUERIES

- All queries go through typed Supabase client from `lib/supabase/server.ts`
- Never write raw SQL in page/component files — always in `lib/actions/`
- Always destructure `{ data, error }` from Supabase calls
- Always handle the `error` case before using `data`
- Use `.select('column1, column2')` — never `.select('*')` in production queries
  (exception: seed/admin operations)

---

## CONSTANTS — NO MAGIC VALUES

```typescript
// src/types/index.ts
export const SHIPMENT_STATUSES = [
  'draft','confirmed','assigned','in_transit','delivered','delayed','cancelled'
] as const

export type ShipmentStatus = typeof SHIPMENT_STATUSES[number]

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  draft:      'bg-gray-100 text-gray-700',
  confirmed:  'bg-blue-100 text-blue-700',
  assigned:   'bg-purple-100 text-purple-700',
  in_transit: 'bg-amber-100 text-amber-700',
  delivered:  'bg-green-100 text-green-700',
  delayed:    'bg-red-100 text-red-700',
  cancelled:  'bg-gray-100 text-gray-500 line-through',
}
```

---

## WHAT TO NEVER DO

- Never `console.log` in production code (use only for debugging, remove before commit)
- Never hardcode UUIDs, emails, or passwords in source files
- Never use `useEffect` for data fetching — use server components
- Never mutate state directly — always use setState or form submission
- Never skip the loading state — judges will click fast
- Never skip the empty state — judges will test with no data
- Never use `!important` in styles

---
*Standards v1.0 — NextGen TMS Platform*