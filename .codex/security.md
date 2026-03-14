# Security Rules — NextGen TMS Platform
> Directly maps to "Code Security" judging criterion.
> Codex must read this before writing auth, API routes, or server actions.

---

## SECRET MANAGEMENT

### Rule 1 — Never commit secrets
```
.env.local          → in .gitignore → NEVER in GitHub
.env*.local         → in .gitignore → NEVER in GitHub
```

### Rule 2 — Server-only secrets
These variables must NEVER have `NEXT_PUBLIC_` prefix:
- `SUPABASE_SERVICE_ROLE_KEY` — has admin DB access, bypasses RLS
- `ANTHROPIC_API_KEY` — paid API, exposes your account if leaked

Verify by checking browser DevTools → Network → any request → look at response headers.
If either key appears in the browser, you have a security bug.

### Rule 3 — .env.example committed with empty values
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=
```
This file IS committed. It shows what variables are needed without exposing values.

### Rule 4 — GitHub MCP pre-commit check
Before every push via GitHub MCP, verify diff does not include:
- `.env.local`
- Any file containing a real Supabase URL + key together
- Any file containing `ANTHROPIC_API_KEY` with a real value

---

## AUTHENTICATION

### Supabase Auth patterns
```typescript
// Get user in server component — use getUser() NOT getSession()
// getSession() can be spoofed by client. getUser() validates server-side.
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### Protected routes — middleware.ts handles this
All routes under `/dashboard`, `/shipments`, `/carriers`, `/drivers`, `/routes`, `/warehouses`
are protected. Unauthenticated requests redirect to `/login`.
Never rely on client-side auth checks alone.

### Auth callback route
```
src/app/auth/callback/route.ts
```
Required for Supabase email confirmation and OAuth flows.
Must be in Supabase redirect allowlist.

---

## ROW LEVEL SECURITY

RLS is the MOST important security feature. Judges specifically check for this.

### Verify RLS is on
```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- ALL tables must show rowsecurity = true
```

### What happens without RLS
Any authenticated user can read/write ALL data in ALL tables.
Customers can see other customers' shipments. Dispatchers can delete anything.
This is a critical security failure.

### The get_my_role() helper
```sql
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;
```
Used in every RLS policy. Do not query profiles table directly in policies.

### Never disable RLS
Even for development or testing. Use the service role key in a separate script
if you need to bypass RLS for admin operations.

---

## INPUT VALIDATION

### Both layers required
- Layer 1 (client): Zod schema with `zodResolver` in React Hook Form
- Layer 2 (server): Same Zod schema parsed again in server action

```typescript
// Server action — always re-validate
export async function createShipment(input: unknown) {
  const parsed = shipmentSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.flatten() }
  // safe to use parsed.data now
}
```

### What to validate
- All string inputs: min/max length
- Numbers: positive check, range check
- Enums: only allowed values (status, cargo_type, role)
- Dates: valid date format
- Never trust `input as ShipmentType` — always parse with Zod

---

## API ROUTES SECURITY

The only API route is `/api/ai/delay-prediction`.

```typescript
// src/app/api/ai/delay-prediction/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // 1. Verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse + validate body
  const body = await request.json()
  // validate required fields

  // 3. Call Anthropic — ANTHROPIC_API_KEY is process.env only, never returned to client
  // 4. Return only the safe response shape
  return Response.json({ risk, reason, confidence })
}
```

### What the API route must never return
- The raw Anthropic API response
- Internal error stack traces
- The API key or any env variable value

---

## SUPABASE SERVICE ROLE KEY

Only use `SUPABASE_SERVICE_ROLE_KEY` when you need to bypass RLS (admin scripts, seed data).
In the app itself, always use the anon key via the server client.
The server client + RLS is the correct pattern — not service role in app code.

---

## CHECKLIST BEFORE SUBMITTING

```
[ ] .env.local not in GitHub (check: git ls-files | grep env)
[ ] SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix
[ ] ANTHROPIC_API_KEY has no NEXT_PUBLIC_ prefix
[ ] RLS enabled on all 7 tables (run verification SQL)
[ ] /dashboard without auth → /login (not 500 error)
[ ] /api/ai/delay-prediction without auth → 401
[ ] No real keys visible in browser DevTools Network tab
[ ] Zod validation on both client and server for all forms
```

---
*Security v1.0 — NextGen TMS Platform*