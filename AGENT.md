# NextGen TMS Platform — Codex Agent Instructions
> Stack: Next.js 15 (App Router) + Supabase + Vercel + TypeScript
> Domain: Transportation Management System
> Hackathon: 6 Hours | OS: Linux | Solo

---

## CODEX BEHAVIOUR RULES — FOLLOW ALWAYS

### Token Efficiency
- Be concise. No long explanations before writing code — just write it.
- No "Here is the code for..." preamble. Start file content immediately.
- Batch file creation. When a prompt asks for multiple files, create ALL in one response — never ask "should I continue?" between files.
- No redundant comments. Comments only for non-obvious logic.
- No placeholder code. Every function must be fully implemented — never write `// TODO`.
- Shortest working solution wins. Do not over-engineer.
- Do not repeat instructions back. Just execute.

### Git + Secret Safety
- Never suggest committing `.env.local` — it stays in `.gitignore` always.
- Never print real API keys, passwords, or tokens in any response or file.
- Never hardcode secrets in any source file — always read from `process.env`.
- Before every commit via GitHub MCP — check diff first. Never push `.env.local` or any file with real secret values.
- `.env.example` IS committed — empty values only, as a template.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never `NEXT_PUBLIC_`.

---

## TECH STACK

```
Framework    : Next.js 15 (App Router, src/ directory, TypeScript)
Database     : Supabase (PostgreSQL + RLS + Realtime)
Auth         : Supabase Auth (email + password)
Deployment   : Vercel
Styling      : Tailwind CSS + shadcn/ui
Forms        : React Hook Form + Zod
Risk Engine  : Smart delay risk calculation (no external API — pure logic)
Icons        : lucide-react
Dates        : date-fns
Notifications: sonner
State        : React built-in (useState, useReducer)
```

### Critical Version Rules
- Use `@supabase/ssr` — NOT `@supabase/auth-helpers` (deprecated)
- `cookies()` from `next/headers` requires `await` in Next.js 15
- Server components by default — `'use client'` only when hooks/browser APIs needed
- Server Actions for mutations — API routes only for delay risk endpoint

---

## MCP SERVERS

| MCP | Use For |
|---|---|
| Supabase MCP | Create tables, run SQL, seed data, RLS policies |
| Vercel MCP | Deploy, set env vars, get live URL |
| GitHub MCP | Commit + push — always check diff before pushing |

> Context7 MCP NOT installed. Use inline hints: "Next.js 15 App Router + @supabase/ssr"

```bash
# Terminal 1
npm run dev

# Terminal 2
GITHUB_TOKEN="your_pat" codex
```

### ~/.codex/config.toml
```toml
experimental_use_rmcp_client = true

[mcp_servers.supabase]
url = "https://mcp.supabase.com/mcp"
startup_timeout_sec = 120
tool_timeout_sec = 600

[mcp_servers.vercel]
url = "https://mcp.vercel.com/"
startup_timeout_sec = 120
tool_timeout_sec = 600

[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp/"
bearer_token_env_var = "GITHUB_TOKEN"
startup_timeout_sec = 120
tool_timeout_sec = 600
```

---

## READ BEFORE WRITING CODE

| Situation | Read |
|---|---|
| Any code | `.codex/standards.md` |
| Database | `.codex/database.md` |
| Feature scope | `.codex/business.md` |
| Phase progress | `.codex/phases.md` |
| Auth / API | `.codex/security.md` |
| UI component | `.codex/ui-ux.md` |
| Server actions | `.codex/api.md` |
| Env vars | `.codex/env.md` |
| Before demo | `.codex/judging.md` |

---

## FOLDER STRUCTURE

```
nextgen-tms-platform/
├── AGENT.md
├── .env.local                    ← NEVER commit
├── .env.example                  ← COMMIT (empty values)
├── .gitignore
├── .mcp.json
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── components.json
├── .codex/
│   ├── database.md
│   ├── business.md
│   ├── phases.md
│   ├── standards.md
│   ├── security.md
│   ├── env.md
│   ├── ui-ux.md
│   ├── api.md
│   └── judging.md
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── shipments/
    │   │   │   ├── page.tsx
    │   │   │   ├── new/page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── carriers/page.tsx
    │   │   ├── drivers/page.tsx
    │   │   ├── routes/page.tsx
    │   │   └── warehouses/page.tsx
    │   ├── api/
    │   │   └── delay-risk/
    │   │       └── route.ts
    │   ├── auth/callback/route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ui/
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   └── RegisterForm.tsx
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   └── MobileNav.tsx
    │   ├── shipments/
    │   │   ├── ShipmentTable.tsx
    │   │   ├── ShipmentForm.tsx
    │   │   ├── ShipmentStatusBadge.tsx
    │   │   ├── DelayRiskBadge.tsx        ← smart risk engine feature
    │   │   └── DeleteShipmentDialog.tsx
    │   ├── carriers/
    │   │   ├── CarrierTable.tsx
    │   │   └── CarrierStatusBadge.tsx
    │   ├── drivers/
    │   │   └── DriverTable.tsx
    │   ├── routes/
    │   │   └── RouteTable.tsx
    │   ├── warehouses/
    │   │   └── WarehouseTable.tsx
    │   └── dashboard/
    │       └── StatsCard.tsx
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── middleware.ts
    │   ├── validations/
    │   │   ├── auth.ts
    │   │   ├── shipment.ts
    │   │   └── carrier.ts
    │   ├── actions/
    │   │   ├── auth.ts
    │   │   ├── shipments.ts
    │   │   ├── carriers.ts
    │   │   ├── drivers.ts
    │   │   ├── routes.ts
    │   │   └── warehouses.ts
    │   ├── risk-engine.ts             ← delay risk calculation logic
    │   ├── config.ts
    │   └── utils.ts
    ├── hooks/
    │   └── useShipments.ts
    └── types/
        ├── database.ts
        └── index.ts
```

---

## ONE-TIME SETUP COMMANDS

```bash
# 1. Scaffold (already inside cloned repo)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

# 2. Update .gitignore BEFORE first commit
cat >> .gitignore << 'EOF'
.env.local
.env*.local
*.pem
.DS_Store
EOF

# 3. Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react clsx tailwind-merge sonner date-fns

# 4. shadcn
npx shadcn@latest init --yes
npx shadcn@latest add button input label form card dialog select textarea badge avatar dropdown-menu sheet separator skeleton table toast

# 5. .mcp.json
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
EOF

# 6. .env.example
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

---

## SHIPMENT STATE MACHINE

```
DRAFT → CONFIRMED → ASSIGNED → IN_TRANSIT → DELIVERED
                                    ↓
                                 DELAYED → IN_TRANSIT (recovery)

DRAFT or CONFIRMED → CANCELLED (terminal)
DELIVERED → terminal
CANCELLED → terminal
```

Valid values: `draft` `confirmed` `assigned` `in_transit` `delivered` `delayed` `cancelled`
Only `admin` and `dispatcher` can change status.
Delay risk badge shows on `in_transit` and `assigned` only.

---

## USER ROLES

| Role | Access |
|---|---|
| `admin` | Full access — all tables |
| `dispatcher` | Create/edit shipments, assign carriers/drivers |
| `customer` | Read own shipments only |

---

## SMART DELAY RISK ENGINE — EXACT IMPLEMENTATION

No external API. Pure calculation using data already in the database.

### Logic file: `src/lib/risk-engine.ts`
```typescript
export type RiskLevel = 'low' | 'medium' | 'high'

export interface RiskResult {
  risk: RiskLevel
  reason: string
  confidence: number
}

export interface RiskInput {
  status: string
  cargo_type: string
  carrier_rating: number
  distance_km: number | null
  scheduled_delivery: string | null
  weight_kg: number
}

export function calculateDelayRisk(input: RiskInput): RiskResult {
  // Already delayed — always high
  if (input.status === 'delayed') {
    return { risk: 'high', reason: 'Shipment is currently delayed', confidence: 95 }
  }

  let score = 0
  const reasons: string[] = []

  // Factor 1: overdue (40 pts)
  if (input.scheduled_delivery && new Date(input.scheduled_delivery) < new Date()) {
    score += 40
    reasons.push('past scheduled delivery date')
  }

  // Factor 2: carrier rating (0–25 pts)
  if (input.carrier_rating < 3.5) {
    score += 25
    reasons.push('low carrier performance rating')
  } else if (input.carrier_rating < 4.0) {
    score += 10
    reasons.push('average carrier rating')
  }

  // Factor 3: sensitive cargo (20 pts)
  if (['hazardous', 'perishable'].includes(input.cargo_type)) {
    score += 20
    reasons.push(`${input.cargo_type} cargo requires special handling`)
  }

  // Factor 4: long distance (0–15 pts)
  if (input.distance_km && input.distance_km > 1500) {
    score += 15
    reasons.push('long-haul route over 1500km')
  } else if (input.distance_km && input.distance_km > 800) {
    score += 8
    reasons.push('medium-distance route')
  }

  // Factor 5: heavy cargo (5 pts)
  if (input.weight_kg > 3000) {
    score += 5
    reasons.push('heavy cargo load')
  }

  const risk: RiskLevel = score >= 50 ? 'high' : score >= 20 ? 'medium' : 'low'
  const confidence = Math.min(92, 55 + score)
  const reason = reasons.length > 0
    ? reasons.join(', ')
    : 'Carrier performance and route metrics look good'

  return { risk, reason, confidence }
}
```

### API route: `src/app/api/delay-risk/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { calculateDelayRisk, type RiskInput } from '@/lib/risk-engine'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body: RiskInput = await request.json()
  const result = calculateDelayRisk(body)
  return Response.json(result)
}
```

### Badge component: `src/components/shipments/DelayRiskBadge.tsx`
- Shows on `in_transit` and `assigned` shipments only
- green = low, yellow = medium, red = high
- Hover tooltip shows reason + confidence %
- Loading spinner while fetching
- If API errors → hide badge silently

### Demo talking point:
> "The delay risk engine analyses real-time factors — carrier performance rating,
> cargo sensitivity, route distance, and delivery schedule — to flag shipments
> at risk before they become problems."

---

## NON-NEGOTIABLES

1. Both client-side AND server-side Zod validation on every form
2. RLS enabled on every Supabase table — no exceptions
3. No `any` TypeScript type — ever
4. Loading states on every async operation
5. User-friendly error messages — never show raw error objects to user
6. Mobile-first — works at 375px width
7. No hardcoded URLs — always use `APP_URL` from `lib/config.ts`
8. `SUPABASE_SERVICE_ROLE_KEY` is server-only — never `NEXT_PUBLIC_`
9. No inline styles — Tailwind only
10. No secrets in any committed file — ever

---

## SUPABASE CLIENT PATTERNS

### lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

### middleware.ts (project root)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const isDashboard = ['/dashboard','/shipments','/carriers','/drivers','/routes','/warehouses']
    .some(p => request.nextUrl.pathname.startsWith(p))
  const isAuthPage = ['/login','/register']
    .some(p => request.nextUrl.pathname.startsWith(p))
  if (!user && isDashboard) return NextResponse.redirect(new URL('/login', request.url))
  if (user && isAuthPage) return NextResponse.redirect(new URL('/dashboard', request.url))
  return supabaseResponse
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### lib/config.ts
```typescript
export const APP_URL = (() => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  return 'http://localhost:3000'
})()
```

---

## PROMPT TEMPLATES — COPY-PASTE DURING HACKATHON

### Prompt 0 — Supabase Setup
```
Read AGENT.md and .codex/database.md.
Using Supabase MCP: create project "nextgen-tms", run all SQL in exact order
from .codex/database.md — tables, triggers, indexes, RLS, seed data.
Return NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
No explanations — just execute.
```

### Prompt 1 — Auth
```
Read AGENT.md + .codex/standards.md + .codex/security.md.
Build complete auth. Next.js 15 App Router + @supabase/ssr (not auth-helpers).
Files: (auth)/layout.tsx, login/page.tsx, register/page.tsx,
auth/callback/route.ts, lib/validations/auth.ts, lib/actions/auth.ts,
LoginForm.tsx, RegisterForm.tsx.
Zod client + server. Toast errors. Redirect /dashboard on success.
No placeholders. Create all files now.
```

### Prompt 2 — Layout + Dashboard
```
Read AGENT.md + .codex/ui-ux.md.
Build layout and dashboard. Next.js 15 App Router.
Files: (dashboard)/layout.tsx, Sidebar.tsx, Header.tsx, MobileNav.tsx,
dashboard/page.tsx, StatsCard.tsx.
Sidebar links: Dashboard, Shipments, Carriers, Drivers, Routes, Warehouses.
Stats: total shipments, in_transit, delivered, active carriers, available drivers.
Mobile-first. Sidebar collapses mobile. Modern SaaS look.
No placeholders. Create all files now.
```

### Prompt 3 — Shipments
```
Read AGENT.md + .codex/business.md + .codex/database.md.
Build shipments module. Next.js 15 + @supabase/ssr.
Files: lib/validations/shipment.ts, lib/actions/shipments.ts,
shipments/page.tsx, shipments/new/page.tsx, shipments/[id]/page.tsx,
ShipmentTable.tsx, ShipmentForm.tsx, ShipmentStatusBadge.tsx, DeleteShipmentDialog.tsx.
State machine: draft→confirmed→assigned→in_transit→delivered.
Form includes carrier, driver, origin/destination warehouse, route dropdowns.
Search + status filter. Empty state. No placeholders. Create all files now.
```

### Prompt 4 — Delay Risk Badge
```
Read AGENT.md — Smart Delay Risk Engine section specifically.
Build the delay risk feature with NO external API — pure calculation only.
Files:
1. src/lib/risk-engine.ts — calculateDelayRisk function exactly as defined in AGENT.md
2. src/app/api/delay-risk/route.ts — POST, auth check, calls calculateDelayRisk, returns result
3. src/components/shipments/DelayRiskBadge.tsx — fetches from /api/delay-risk,
   green=low, yellow=medium, red=high, hover tooltip shows reason + confidence%,
   loading spinner while fetching, hides silently on error.
Show badge on in_transit + assigned shipments only.
No external API keys. No placeholders. Create all files now.
```

### Prompt 5 — Carriers + Drivers
```
Read AGENT.md + .codex/business.md.
Build carriers and drivers modules. Next.js 15 + @supabase/ssr.
Files: lib/actions/carriers.ts, carriers/page.tsx, CarrierTable.tsx,
CarrierStatusBadge.tsx, lib/actions/drivers.ts, drivers/page.tsx, DriverTable.tsx.
Carriers: name, mode badge, rating stars, status badge.
Drivers: name, license, expiry, phone, carrier name, vehicle, status badge.
No placeholders. Create all files now.
```

### Prompt 6 — Routes + Warehouses
```
Read AGENT.md + .codex/business.md.
Build routes and warehouses display pages. Next.js 15 + @supabase/ssr.
Files: lib/actions/routes.ts, routes/page.tsx, RouteTable.tsx,
lib/actions/warehouses.ts, warehouses/page.tsx, WarehouseTable.tsx.
Routes: name, origin→dest, distance, est. hours, mode badge, toll, active.
Warehouses: code, name, city, state, capacity, status badge, manager.
Display only — no create/edit. No placeholders. Create all files now.
```

### Prompt 7 — Landing Page
```
Read AGENT.md + .codex/ui-ux.md.
Build src/app/page.tsx — landing page.
Hero: "NextGen TMS" headline, subtext, CTA buttons (Get Started→/register, Login→/login).
Features grid (6 items): Shipment Tracking, Carrier Management, Driver Management,
Route Optimization, Warehouse Management, Smart Delay Risk Engine.
Clean, modern, professional. Tailwind only. No placeholders.
```

### Prompt 8 — Deploy
```
Run npm run build — fix ALL errors first.
Using GitHub MCP: check diff — confirm .env.local NOT staged.
Commit: "feat: complete NextGen TMS — shipments, carriers, drivers, routes, warehouses, delay risk engine".
Push to main.
Using Vercel MCP: create project "nextgen-tms-platform", connect GitHub repo,
set env vars (I will provide), deploy production, return live URL.
```

---

## 6-HOUR PHASE CHECKLIST

```
PHASE 1 — Setup (0:00–1:00)
[ ] Next.js scaffolded
[ ] .gitignore updated BEFORE first commit
[ ] .env.example committed (empty values only)
[ ] .env.local created locally (NOT committed)
[ ] Dependencies installed (no @anthropic-ai/sdk needed)
[ ] .mcp.json created
[ ] Supabase project created via MCP
[ ] All 7 tables + triggers + indexes + RLS via MCP
[ ] Seed data inserted via MCP
[ ] .env.local filled with Supabase values
[ ] npm run dev works

PHASE 2 — Auth + Layout (1:00–1:45)
[ ] Login works
[ ] Register works
[ ] Logout works
[ ] /dashboard without auth → /login
[ ] Sidebar with all 6 nav links
[ ] Mobile hamburger works
[ ] Dashboard stats load real numbers

PHASE 3 — Shipments (1:45–3:00)
[ ] List with seed data visible
[ ] Search works
[ ] Status filter works
[ ] Create form validates + saves
[ ] Detail page loads all fields
[ ] Status badge correct colors
[ ] Delete with confirmation

PHASE 4 — Carriers + Drivers (3:00–3:45)
[ ] Carriers list with seed data
[ ] Driver list with seed data
[ ] Carrier rating stars visible

PHASE 5 — Routes + Warehouses (3:45–4:15)
[ ] Routes list with seed data
[ ] Warehouses list with seed data

PHASE 6 — Delay Risk Badge (4:15–4:45)
[ ] risk-engine.ts calculation logic working
[ ] /api/delay-risk returns correct shape
[ ] Badge renders green/yellow/red
[ ] Hover shows reason + confidence
[ ] Badge shows on in_transit + assigned only
[ ] No external API keys needed

PHASE 7 — Landing Page (4:45–5:00)
[ ] / renders without auth
[ ] Hero + CTA buttons work
[ ] 6 feature cards visible

PHASE 8 — Polish + Deploy (5:00–6:00)
[ ] npm run build — 0 errors
[ ] Mobile 375px — no horizontal scroll
[ ] Vercel live URL works
[ ] Auth on production
[ ] Seed data on production
[ ] No console errors
[ ] Demo video recorded
[ ] All 3 links ready to submit
```

---

## DEMO VIDEO SCRIPT (4 min)

```
0:00–0:30  Landing page — problem + solution pitch
0:30–1:15  Auth — register → dashboard with 5 stats cards
1:15–2:15  Shipments — create → list → detail → delay risk badge + hover tooltip
2:15–2:45  Carriers + Drivers lists with ratings and status badges
2:45–3:15  Routes + Warehouses lists
3:15–3:45  Code: GitHub repo structure + Supabase RLS on all 7 tables
3:45–4:00  Live Vercel URL + mobile view at 375px

Demo line for risk badge:
"The delay risk engine analyses carrier performance, cargo sensitivity,
route distance, and delivery schedule to flag shipments at risk in real time."
```

---

## MANUAL QA — RUN BEFORE SUBMITTING

```
Auth:
[ ] Wrong password → error toast
[ ] Correct login → /dashboard
[ ] Register → /dashboard
[ ] Duplicate email → error
[ ] Logout → /login
[ ] /dashboard without auth → /login
[ ] Session persists on refresh

Shipments:
[ ] Seed data visible on load
[ ] Search works
[ ] Filter works
[ ] Create validates + saves
[ ] Detail page loads
[ ] Delay risk badge on in_transit shipments
[ ] Badge hover shows reason + confidence
[ ] Delete works

Carriers / Drivers / Routes / Warehouses:
[ ] All 4 list pages load with seed data

Security:
[ ] No Supabase keys in browser DevTools Network tab
[ ] .env.local not in GitHub repo
[ ] /dashboard without auth → /login

Responsive:
[ ] 375px — no horizontal scroll
[ ] Mobile sidebar collapses

Production:
[ ] Vercel URL loads
[ ] Auth works on production
[ ] Seed data visible
[ ] No console errors
```

---
*NextGen TMS Platform — Bacancy Hackathon*
*7 tables | Smart Delay Risk Engine | No external APIs | 6 hours*