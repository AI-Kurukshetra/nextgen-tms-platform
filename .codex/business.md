# Business Requirements — NextGen TMS Platform
> Updated scope baseline aligned to the March 14, 2026 guide.
> Rule zero: check existing code/tables/APIs first; extend/reuse before creating new assets.

---

## SYSTEM GOAL

The platform manages the full logistics lifecycle:
`Order -> Shipment -> Route Planning -> Carrier Assignment -> Tracking -> Delivery -> Billing`

This build targets a production-ready core for operations teams and customer visibility.

---

## ROLES

| Role | Capabilities |
|---|---|
| `admin` | Full access to all operational modules and destructive actions |
| `dispatcher` | Full operational access except restricted admin-only actions |
| `customer` | Read-only customer portal and own shipment visibility |

Public signup includes role selection for `customer` or `dispatcher`; admin provisioning can create `admin`, `dispatcher`, or `customer`.

---

## MODULE STATUS MATRIX

| Module | Scope | Status |
|---|---|---|
| Authentication & User Management | login, register, session, role-gated UI, middleware protection | Implemented |
| Customer Management | customer self-service portal, user creation with role, customer directory | Implemented |
| Shipment Management | create/list/detail/delete, status workflow, risk, tracking timeline | Implemented |
| Carrier & Fleet Management | carriers + drivers + assignment visibility | Implemented |
| Route Management | route catalog, mode and active filtering + optimization assistant | Implemented |
| Tracking System | shipment tracking feed + tracking update APIs + live GPS coordinates | Implemented |
| Document Management | normalized document tables, shipment links, upload/list/delete flow | Implemented |
| Billing & Freight Management | quote engine, rate page, freight audit + invoice/payment workflow | Implemented |
| Warehouse & Inventory | warehouse directory + inventory visibility metrics | Implemented |
| Integrations | EDI payload generation, load board posting, KPI API | Implemented |
| Driver Mobility | driver mobile assignment feed/page | Implemented |

---

## ACCEPTANCE CRITERIA BY PAGE

### Public

#### `/`
- [x] Brand headline and value proposition
- [x] CTA to `/register` and `/login`
- [x] Feature grid for core modules

### Auth

#### `/login`
- [x] Email/password validation (client + server)
- [x] Error toast on invalid credentials
- [x] Redirect to `/dashboard` on success
- [x] Visitor quick-fill demo accounts for `admin`, `dispatcher`, `customer`

#### `/register`
- [x] Full name/email/password/confirm password validation
- [x] Role/profile metadata captured on signup
- [x] Redirect to `/dashboard` on success

### Core Ops

#### `/dashboard`
- [x] Real counts: shipments/carriers/drivers status KPIs
- [x] Delayed shipments alert
- [x] Recent shipments section

#### `/shipments`
- [x] Search + status filtering
- [x] Table with shipment essentials
- [x] Create CTA for operational roles

#### `/shipments/new`
- [x] Typed form with all required shipping/assignment/schedule/cost fields
- [x] Dropdown data sourced from active carriers/drivers/routes/warehouses
- [x] Customer assignment (`customer_id`) from customer dropdown
- [x] Successful create redirects to shipment detail

#### `/shipments/[id]`
- [x] Shipment, route, carrier, driver, warehouse, schedule detail cards
- [x] Tracking timeline
- [x] Delay risk badge
- [x] Status update flow by role
- [x] Delete flow by role
- [x] Document/notification/load-planning/compliance/freight-audit/integration panels

#### `/carriers`
- [x] Mode + status filters
- [x] Rating stars and status badges

#### `/drivers`
- [x] Driver operational grid with license expiry/status indicators
- [x] Link to mobile assignments view

#### `/drivers/mobile`
- [x] Driver assignment feed for mobile workflow
- [x] Driver trip lifecycle actions (start/resume/complete) with POD capture

#### `/routes`
- [x] Mode + active filters
- [x] Distance/time/cost visibility

#### `/warehouses`
- [x] Warehouse status and capacity visibility

#### `/inventory`
- [x] Warehouse-level inbound/outbound/in-transit inventory flow metrics
- [x] WMS integration bridge for inbound/outbound sync updates

#### `/rates`
- [x] Freight quote calculator and pricing transparency

#### `/invoicing`
- [x] Freight audit checks for billing mismatch/risk cues
- [x] Invoice issue + partial/full payment posting + payment trail

#### `/reports`
- [x] KPI analytics for delivery performance, cost efficiency, and carrier performance

### Customer Experience

#### `/customer`
- [x] Customer self-service shipment visibility

#### `/customers`
- [x] Ops-facing customer directory with shipment activity metrics
- [x] Create user accounts with role (`customer` by dispatcher, all roles by admin)
- [x] Admin role update control for existing users

---

## API SURFACE (BUSINESS VIEW)

- Tracking: `/api/tracking`
- Live Tracking: `/api/tracking/live`
- Delay Risk: `/api/delay-risk`
- Quote: `/api/quote`
- Documents: `/api/documents`
- Notifications: `/api/notifications/send`
- Compliance: `/api/compliance/check`
- Load Planning: `/api/load-planning`
- Route Optimization: `/api/routes/optimize`
- Invoicing Audit: `/api/invoicing/audit`
- Inventory Visibility: `/api/inventory/visibility`
- Reports KPIs: `/api/reports/kpis`
- Integrations: `/api/integrations/edi`, `/api/integrations/load-board`, `/api/integrations/wms`
- Driver Mobile Feed: `/api/drivers/mobile`

---

## NON-FUNCTIONAL EXPECTATIONS

- Type-safe implementation end to end (Zod + TS + typed Supabase)
- Role-aware authorization on server paths and mutations
- No secret leakage (`.env.local` never committed)
- No duplicated modules/tables/APIs
- Mobile-safe responsive layout for operations pages
- Modernized UI with Tailwind gradients, cards, charts, and subtle motion

---

## FUTURE ENHANCEMENTS (NOT REQUIRED FOR CURRENT STABLE CORE)

- AI route optimization
- Dynamic freight pricing from external live market feeds
- Carbon emission tracking
- IoT cargo telemetry ingestion

Current build ships deterministic risk, compliance, and audit logic suitable for MVP stability.
