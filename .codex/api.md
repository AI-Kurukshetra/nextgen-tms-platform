# API & Server Actions — NextGen TMS Platform
> Patterns for all server actions and API routes.

---

## ARCHITECTURE DECISION

| Operation | Pattern | Why |
|---|---|---|
| Data reads | Server components + direct Supabase calls | Fastest, no API overhead |
| Mutations (create/update/delete) | Server Actions | No API route needed |
| AI delay prediction | API Route (`/api/ai/...`) | Needs server-side Anthropic SDK |

---

## SERVER ACTION PATTERN

Every server action in `src/lib/actions/` follows this exact shape:

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { shipmentSchema } from '@/lib/validations/shipment'

export async function createShipment(input: unknown) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  // 2. Validate input
  const parsed = shipmentSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.flatten() }

  // 3. DB operation
  const { data, error } = await supabase
    .from('shipments')
    .insert({ ...parsed.data, created_by: user.id })
    .select('id, shipment_number')
    .single()

  if (error) return { data: null, error: error.message }

  // 4. Revalidate affected pages
  revalidatePath('/shipments')

  return { data, error: null }
}
```

---

## QUERY PATTERNS

### List with filter
```typescript
export async function getShipments(status?: string, search?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('shipments')
    .select(`
      id, shipment_number, origin_city, destination_city,
      cargo_type, weight_kg, status, freight_cost, scheduled_delivery,
      carriers ( name, transport_mode ),
      drivers ( full_name )
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (search) query = query.or(
    `shipment_number.ilike.%${search}%,origin_city.ilike.%${search}%,destination_city.ilike.%${search}%`
  )

  const { data, error } = await query
  return { data, error: error?.message ?? null }
}
```

### Single record with relations
```typescript
export async function getShipmentById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      carriers ( * ),
      drivers ( * ),
      routes ( * ),
      origin_warehouse:warehouses!origin_warehouse_id ( * ),
      dest_warehouse:warehouses!destination_warehouse_id ( * ),
      tracking_events ( * )
    `)
    .eq('id', id)
    .single()
  return { data, error: error?.message ?? null }
}
```

### Update status
```typescript
export async function updateShipmentStatus(id: string, status: ShipmentStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('shipments')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(`/shipments/${id}`)
  revalidatePath('/shipments')
  return { error: null }
}
```

### Delete
```typescript
export async function deleteShipment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('shipments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/shipments')
  return { error: null }
}
```

---

## AI API ROUTE PATTERN

```typescript
// src/app/api/ai/delay-prediction/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Parse body
  const { origin, destination, carrierId, scheduledDate, status } = await request.json()
  if (!origin || !destination) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Call Anthropic — keep prompt short to save tokens
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `TMS shipment: ${origin} to ${destination}, status: ${status}, delivery: ${scheduledDate}.
Assess delay risk. Reply with JSON only: {"risk":"low"|"medium"|"high","reason":"one sentence","confidence":0-100}`
    }]
  })

  // Parse response safely
  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = JSON.parse(text)
    return Response.json(result)
  } catch {
    return Response.json({ risk: 'low', reason: 'Unable to assess', confidence: 0 })
  }
}
```

---

## DASHBOARD STATS QUERY

```typescript
// src/lib/actions/dashboard.ts
export async function getDashboardStats() {
  const supabase = await createClient()

  const [total, inTransit, delivered, activeCarriers, availableDrivers, delayed] =
    await Promise.all([
      supabase.from('shipments').select('id', { count: 'exact', head: true }),
      supabase.from('shipments').select('id', { count: 'exact', head: true }).eq('status','in_transit'),
      supabase.from('shipments').select('id', { count: 'exact', head: true }).eq('status','delivered'),
      supabase.from('carriers').select('id', { count: 'exact', head: true }).eq('status','active'),
      supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status','available'),
      supabase.from('shipments').select('id', { count: 'exact', head: true }).eq('status','delayed'),
    ])

  return {
    total: total.count ?? 0,
    inTransit: inTransit.count ?? 0,
    delivered: delivered.count ?? 0,
    activeCarriers: activeCarriers.count ?? 0,
    availableDrivers: availableDrivers.count ?? 0,
    delayed: delayed.count ?? 0,
  }
}
```

---

## AUTH ACTIONS

```typescript
// src/lib/actions/auth.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function register(fullName: string, email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

---

## REVALIDATION RULES

| Action | Revalidate |
|---|---|
| Create/update/delete shipment | `/shipments`, `/shipments/[id]`, `/dashboard` |
| Update carrier | `/carriers` |
| Update driver | `/drivers` |

Use `revalidatePath()` at end of successful mutations.

---
*API v1.0 — NextGen TMS Platform*