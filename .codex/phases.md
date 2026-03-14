# Build Phases — NextGen TMS Platform
> Updated execution and completion tracker (as of March 14, 2026).

---

## PHASE 1 — Foundation

- [x] Next.js 15 App Router + TypeScript + Tailwind setup
- [x] Supabase SSR clients (browser/server/middleware patterns)
- [x] Core env wiring and config helpers
- [x] Database baseline docs + seed strategy

## PHASE 2 — Auth + Core Layout

- [x] Register/login/logout flows
- [x] Auth callback route
- [x] Route protection middleware
- [x] Sidebar/header/mobile navigation

## PHASE 3 — Shipment Core

- [x] Shipment list/search/filter
- [x] Shipment creation form
- [x] Shipment detail page
- [x] Status transition workflow
- [x] Role-gated delete flow

## PHASE 4 — Operations Modules

- [x] Carriers module
- [x] Drivers module
- [x] Routes module
- [x] Warehouses module
- [x] Dashboard KPI cards + recent shipments

## PHASE 5 — Risk, Tracking, and Workflow Extensions

- [x] Delay risk engine + badge + API
- [x] Tracking timeline + tracking API
- [x] Document metadata flow + API
- [x] Notification logging flow + API

## PHASE 6 — Commercial & Planning Extensions

- [x] Rate engine + quote API + rates page
- [x] Freight audit logic + invoicing audit API + page
- [x] Load planning engine + API + shipment integration
- [x] Compliance checks + API + shipment integration

## PHASE 7 — Integrations + Visibility

- [x] EDI payload endpoint
- [x] Load board endpoint with provider mapping
- [x] KPI reporting endpoint
- [x] Inventory visibility endpoint + page

## PHASE 8 — Role Experiences

- [x] Customer self-service portal (`/customer`)
- [x] Ops customer management view (`/customers`)
- [x] Driver mobile assignment board + API (`/drivers/mobile`)

## PHASE 9 — Security + Quality Gates

- [x] API auth/role guard helper integrated across routes
- [x] Server-side validation coverage for mutation payloads
- [x] Lint checks passing
- [x] Build checks passing

## PHASE 10 — Advanced Feature Kickoff (Live GPS)

- [x] `gps_locations` table created with RLS + indexes
- [x] Seeded live GPS points for in-transit sample shipments
- [x] Live tracking API (`/api/tracking/live`) with auth + role gates
- [x] Shipment details live location panel with periodic refresh
- [x] Driver mobile GPS ping action wired to live tracking API

## PHASE 11 — Mandatory No-Key Modules

- [x] Route optimization assistant + `/api/routes/optimize`
- [x] Normalized document management (`document_types`, `documents`, `shipment_documents`)
- [x] Document upload/list/delete connected to shipment detail
- [x] Invoice workflow (`invoices`, `payments`) with issue + payment recording
- [x] Seeded sample documents/invoices/payments in Supabase

## PHASE 12 — Dynamic User & Role Operations

- [x] Customer/user management page made operational (create + role visibility)
- [x] Admin role update action implemented for existing users
- [x] Dispatcher account creation restricted to customer role
- [x] Shipment creation supports assigning a customer (`customer_id`)
- [x] Middleware role gating redirects customer users away from ops-only pages
- [x] Register/login now include explicit role selection with server-side role match validation

---

## REMAINING (OPTIONAL ENHANCEMENTS)

- [ ] External live map provider integration (Google/Mapbox runtime pathing)
- [ ] True outbound Email/SMS provider dispatch instead of event logging only
- [ ] Full invoice/payment ledger tables wired in UI (stage-2 schema path)
- [ ] IoT telemetry ingestion and carbon analytics
