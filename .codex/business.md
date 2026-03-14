# Business Requirements — NextGen TMS Platform
> Exact acceptance criteria. Codex must read this before building any feature.
> Every item below is a testable requirement — not a vague goal.

---

## USERS & ROLES

| Role | Login | What they see |
|---|---|---|
| admin | yes | Everything |
| dispatcher | yes | All shipments, carriers, drivers, routes, warehouses, dashboard |
| customer | yes | Own shipments only (read-only) |

New registrations default to `dispatcher` role. Admin must be set manually in DB.

---

## PAGES & ACCEPTANCE CRITERIA

### / — Landing Page
- [ ] Hero section with "NextGen TMS" headline and one-line value proposition
- [ ] Two CTA buttons: "Get Started" → /register, "Login" → /login
- [ ] Features grid: Shipment Tracking, Carrier Management, Driver Management, Route Optimization, Warehouse Management, AI Delay Prediction
- [ ] Works without being logged in
- [ ] Looks professional — clean, modern, no broken layouts

### /login
- [ ] Email + password fields
- [ ] Client-side Zod validation: email format, password min 6 chars
- [ ] Server-side validation via server action
- [ ] Wrong credentials → error toast (not full page error)
- [ ] Success → redirect to /dashboard
- [ ] Link to /register
- [ ] Already logged in → redirects to /dashboard (middleware)

### /register
- [ ] Full name, email, password, confirm password fields
- [ ] Client-side Zod: all required, email format, passwords match, min 6 chars
- [ ] Server-side validation via server action
- [ ] Duplicate email → error toast
- [ ] Success → redirect to /dashboard
- [ ] Link to /login

### /dashboard
- [ ] Protected — unauthenticated → /login
- [ ] 5 stats cards: Total Shipments, In Transit, Delivered, Active Carriers, Available Drivers
- [ ] Each card shows real number from DB
- [ ] Delayed shipments alert badge if count > 0
- [ ] Recent shipments list (last 5, with status badge)
- [ ] Loads within 2 seconds with seed data

### /shipments
- [ ] Protected route
- [ ] Table showing all shipments (admin/dispatcher) or own (customer)
- [ ] Columns: Shipment #, Origin → Destination, Cargo Type, Weight, Status badge, Carrier, Scheduled Delivery
- [ ] Search: filter by shipment number, origin city, destination city (debounced)
- [ ] Status filter dropdown: All / draft / confirmed / assigned / in_transit / delivered / delayed / cancelled
- [ ] Empty state component when no results
- [ ] "New Shipment" button → /shipments/new
- [ ] Click row → /shipments/[id]
- [ ] Seed data visible immediately on load

### /shipments/new
- [ ] Protected — customer role cannot access (redirect /shipments)
- [ ] Form fields: Origin City*, Origin State*, Destination City*, Destination State*, Cargo Type* (dropdown), Weight KG*, Volume CBM, Carrier (dropdown from DB), Driver (dropdown filtered by carrier), Route (dropdown from DB), Origin Warehouse (dropdown), Destination Warehouse (dropdown), Scheduled Pickup, Scheduled Delivery, Freight Cost, Notes
- [ ] All * fields required — Zod client + server validation
- [ ] Weight must be > 0
- [ ] Submit → creates shipment with status 'draft' → redirect to /shipments/[id]
- [ ] Cancel → back to /shipments

### /shipments/[id]
- [ ] Shows all shipment fields
- [ ] Status badge with correct color (see colors below)
- [ ] AI Delay Prediction badge if status is 'in_transit' or 'assigned'
- [ ] Hover on AI badge shows reason tooltip
- [ ] Carrier details section (name, mode, contact)
- [ ] Driver details section (name, phone, vehicle number) if assigned
- [ ] Route details section (name, distance, estimated hours) if assigned
- [ ] Warehouse details (origin + destination) if assigned
- [ ] Tracking events timeline (from tracking_events table, newest first)
- [ ] Status change button (admin/dispatcher only) — dropdown of valid next statuses per state machine
- [ ] Edit button → /shipments/[id]/edit (admin/dispatcher only)
- [ ] Delete button with confirmation dialog (admin only)

### /carriers
- [ ] Protected route
- [ ] Table: Code, Name, Transport Mode badge, Contact Name, Rating (stars), Status badge
- [ ] Status filter: All / active / inactive / suspended
- [ ] Transport mode filter
- [ ] Seed data visible immediately

### /drivers
- [ ] Protected route
- [ ] Table: Name, License Number, License Expiry, Phone, Carrier Name, Vehicle Number, Vehicle Type, Status badge
- [ ] Status badge: available=green, on_trip=blue, off_duty=gray, suspended=red
- [ ] Filter by status
- [ ] Seed data visible immediately

### /routes
- [ ] Protected route
- [ ] Table: Name, Origin → Destination, Distance (km), Est. Hours, Mode badge, Toll Charges, Active status
- [ ] Filter by transport mode
- [ ] Filter by active/inactive
- [ ] Seed data visible immediately

### /warehouses
- [ ] Protected route
- [ ] Table: Code, Name, City, State, Capacity (sqft), Status badge, Manager Name
- [ ] Status badge: active=green, inactive=gray, maintenance=amber
- [ ] Filter by status
- [ ] Seed data visible immediately

---

## STATUS BADGE COLORS

| Status | Color |
|---|---|
| draft | gray |
| confirmed | blue |
| assigned | purple |
| in_transit | amber |
| delivered | green |
| delayed | red |
| cancelled | gray (strikethrough text) |

---

## AI DELAY PREDICTION BADGE

- Appears on shipment cards/detail only for status: `in_transit`, `assigned`
- Makes POST to /api/ai/delay-prediction
- Shows loading spinner while fetching
- low risk → green badge "Low Risk"
- medium risk → yellow badge "Medium Risk"
- high risk → red badge "High Risk"
- Hover/tooltip shows: reason text + confidence percentage
- If API fails → show nothing (do not show error to user)
- Response cached per shipment ID for the session (avoid repeated API calls)

---

## NAVIGATION SIDEBAR

Links in order:
1. Dashboard (/dashboard)
2. Shipments (/shipments)
3. Carriers (/carriers)
4. Drivers (/drivers)
5. Routes (/routes)
6. Warehouses (/warehouses)

Active link highlighted. User avatar + name at bottom with logout dropdown.
Collapses to hamburger on mobile (< 768px).

---

## WHAT IS OUT OF SCOPE (do not build)

- Billing / invoicing module
- Document upload / proof of delivery photos
- Email notifications
- Real-time GPS map
- User management page (set roles via DB directly)
- Password reset flow
- Shipment editing after creation (status change only)

---

## SEED DATA VISIBILITY REQUIREMENT

Judges open the app and must see data immediately without any setup.
All list pages must show populated data on first load using seed data from database.md.
Do not hide data behind any "getting started" flow.