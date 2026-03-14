# Security Rules — NextGen TMS Platform
> Security baseline for auth, RLS, API handlers, and secrets.

---

## 1) SECRET MANAGEMENT

### Never commit
- `.env.local`
- `.env*.local`

### Public vs server-only
- Public-safe: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`

Do not expose server keys to client bundles or route responses.

---

## 2) AUTHENTICATION

- Use `supabase.auth.getUser()` for trusted checks.
- Middleware protects operational paths.
- Auth callback route must remain active: `src/app/auth/callback/route.ts`.
- Public register flow enforces explicit role selection (`customer` or `dispatcher`) in signup metadata.
- Duplicate email is blocked in register and admin/dispatcher user provisioning actions.

### Protected route groups
- `/dashboard`
- `/customers`
- `/customer`
- `/shipments`
- `/carriers`
- `/drivers`
- `/routes`
- `/warehouses`
- `/inventory`
- `/rates`
- `/invoicing`

---

## 3) AUTHORIZATION (ROLE ENFORCEMENT)

Role sources come from `profiles.role`.

- `admin`: all operations
- `dispatcher`: operational mutations, reads
- `customer`: read-only own data scope

Server enforcement points:
- server actions (`src/lib/actions/*`)
- API route handlers via `src/lib/api-auth.ts`
- middleware role redirects for customer vs ops paths

---

## 4) ROW LEVEL SECURITY

RLS must stay enabled for all core tables.
Minimum operational policy requirement:
- customers can only read their own shipments/tracking
- dispatcher/admin can operate across logistics entities
- destructive actions are admin-gated where applicable

Never disable RLS in app runtime workflows.

---

## 5) INPUT VALIDATION

Every user payload must be validated twice:
1. Client-side schema for UX feedback.
2. Server-side schema before any DB mutation.

Validation coverage includes:
- auth forms
- shipment create/update
- carrier forms
- customer update
- all API POST payloads

---

## 6) API SECURITY RULES

### Required pattern for every route handler
1. Auth check (`requireApiAuth` or `requireApiRole`).
2. Zod parse request payload/query.
3. Execute operation.
4. Return sanitized JSON.

High-risk mutation endpoints (for example `POST /api/tracking/live`) must be role-gated to `admin/dispatcher`.

### Never return
- secrets
- stack traces
- unfiltered provider payloads containing sensitive metadata

---

## 7) CLIENT SAFETY

- No server keys in client components.
- Do not call privileged Supabase admin APIs from browser code.
- All sensitive operations happen server-side.
- User provisioning and role updates run through server actions using service-role server client only.

---

## 8) RELEASE CHECKLIST

- [ ] `git ls-files | rg "^\.env"` shows only `.env.example`
- [ ] middleware redirect rules behave correctly for unauthenticated users
- [ ] protected APIs return `401` or `403` as expected
- [ ] no secrets appear in browser Network tab payloads
- [ ] no mutation route is missing role validation
- [ ] RLS verified active in Supabase
