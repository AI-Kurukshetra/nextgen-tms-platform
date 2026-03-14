# API & Server Actions — NextGen TMS Platform
> Updated API contract for the expanded operational scope.

---

## ARCHITECTURE

| Operation Type | Pattern |
|---|---|
| Data reads for pages | Server components + typed Supabase calls |
| Mutations | Server Actions under `src/lib/actions` |
| Stateless computation/integration endpoints | Route Handlers under `src/app/api/**/route.ts` |

Server actions are primary for internal app mutations.
Route handlers are used for reusable service-style endpoints and integration payloads.

---

## SERVER ACTION BASE RULES

Every action must:
1. Authenticate with `createClient()` + `auth.getUser()`.
2. Authorize by role when needed.
3. Validate input using Zod.
4. Return `{ data, error }` and avoid throwing.
5. `revalidatePath()` after successful mutations.

Primary action modules:
- `auth.ts`
- `shipments.ts`
- `carriers.ts`
- `drivers.ts`
- `routes.ts`
- `warehouses.ts`
- `dashboard.ts`
- `tracking.ts`
- `inventory.ts`
- `customers.ts`
- `invoicing.ts`

---

## ROUTE HANDLERS (CURRENT)

| Route | Method | Purpose | Access |
|---|---|---|---|
| `/api/delay-risk` | `POST` | Deterministic delay risk scoring | Authenticated |
| `/api/quote` | `POST` | Freight quote from rate engine | Authenticated |
| `/api/tracking` | `GET` | Shipment tracking feed | Authenticated |
| `/api/tracking/live` | `GET/POST` | Live GPS path read + location ping ingest | `GET`: Authenticated, `POST`: Admin/Dispatcher |
| `/api/documents` | `GET/POST/DELETE` | Shipment document metadata and shipment-link management | Authenticated (write role-gated) |
| `/api/notifications/send` | `POST` | Shipment communication logging | Admin/Dispatcher |
| `/api/compliance/check` | `POST` | Shipment compliance evaluation | Admin/Dispatcher |
| `/api/load-planning` | `POST` | Load-fit planning calculation | Admin/Dispatcher |
| `/api/routes/optimize` | `POST` | Route recommendation by preference (fastest/cheapest/balanced) | Authenticated |
| `/api/invoicing/audit` | `POST` | Freight audit check | Admin/Dispatcher |
| `/api/inventory/visibility` | `GET` | Warehouse flow metrics | Admin/Dispatcher |
| `/api/reports/kpis` | `GET` | KPI counters for reporting | Admin/Dispatcher |
| `/api/integrations/edi` | `GET` | EDI 214 payload generation | Admin/Dispatcher |
| `/api/integrations/load-board` | `POST` | Load board payload generation/post-log | Admin/Dispatcher |
| `/api/drivers/mobile` | `GET` | Mobile driver assignment feed | Admin/Dispatcher |

---

## AUTHZ HELPER

`src/lib/api-auth.ts`
- `requireApiAuth()`
- `requireApiRole(allowedRoles)`

All route handlers use these helpers for consistent `401/403` behavior.

---

## STATUS TRANSITION RULES

Shipment status transitions are enforced server-side:
- `draft -> confirmed|cancelled`
- `confirmed -> assigned|cancelled`
- `assigned -> in_transit`
- `in_transit -> delayed|delivered`
- `delayed -> in_transit`
- terminal: `delivered`, `cancelled`

---

## RESPONSE CONTRACT PATTERNS

### Server Action
```ts
{ data: T | null, error: string | null }
```

### API Success
```ts
Response.json({ data: ... })
```

### API Error
```ts
Response.json({ error: "message" }, { status: 4xx | 5xx })
```

---

## REVALIDATION TARGETS

| Mutation | Revalidated Paths |
|---|---|
| Shipment create/update/delete | `/shipments`, `/shipments/[id]`, `/dashboard` |
| Driver status updates | `/drivers`, `/drivers/mobile` |
| Customer updates | `/customers` |
| Document/notification updates | `/shipments/[id]` |

---

## IMPLEMENTATION NOTES

- Avoid duplicate APIs when server actions already solve the flow.
- Keep payload schemas strict (`zod`) for every POST endpoint.
- Keep route handlers side-effect aware (write operations are role-gated and logged where needed).
