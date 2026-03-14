# Build Phases — NextGen TMS Platform
> 6-hour hackathon plan | 7 tables | Linux | Codex CLI
> Check off items as you complete them. Do NOT skip phases.

---

## TIME BUDGET

| Phase | Task | Time |
|---|---|---|
| 1 | Setup — scaffold + Supabase + env | 0:00 – 1:00 |
| 2 | Auth + Layout + Dashboard | 1:00 – 1:45 |
| 3 | Shipments (full CRUD) | 1:45 – 3:00 |
| 4 | Carriers + Drivers | 3:00 – 3:45 |
| 5 | Routes + Warehouses | 3:45 – 4:15 |
| 6 | AI Delay Badge | 4:15 – 4:45 |
| 7 | Landing Page | 4:45 – 5:00 |
| 8 | Polish + Deploy + QA | 5:00 – 6:00 |

---

## PHASE 1 — Setup (0:00–1:00)

**Codex prompt to use:** Prompt 0 from AGENT.md

```
[ ] npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
[ ] .gitignore updated with .env.local BEFORE any commit
[ ] All npm dependencies installed (supabase, zod, rhf, lucide, anthropic, shadcn)
[ ] .mcp.json created
[ ] .env.example committed (empty values)
[ ] Supabase project created via Supabase MCP
[ ] All 7 tables created in correct order via MCP
[ ] All triggers created via MCP
[ ] All indexes created via MCP
[ ] RLS enabled + all policies created via MCP
[ ] Seed data inserted via MCP (carriers, warehouses, drivers, routes, shipments, tracking_events)
[ ] Verification queries run — all counts match expected
[ ] .env.local filled with real Supabase values
[ ] npm run dev starts without errors at localhost:3000
[ ] First GitHub commit pushed (no .env.local)
```

**If Supabase MCP is slow:** Paste SQL directly into Supabase SQL Editor. Same result.
**Phase 1 done when:** `npm run dev` works + all verification queries pass.

---

## PHASE 2 — Auth + Layout + Dashboard (1:00–1:45)

**Codex prompts to use:** Prompt 1, then Prompt 2 from AGENT.md

```
[ ] /login page renders correctly
[ ] LoginForm — Zod validation on client (email format, password min 6)
[ ] LoginForm — server action validates + calls Supabase auth
[ ] Wrong credentials → error toast shown
[ ] Correct credentials → redirect to /dashboard
[ ] /register page renders correctly
[ ] RegisterForm — Zod validation (all fields, passwords match)
[ ] Duplicate email → error toast
[ ] Success → redirect to /dashboard
[ ] /auth/callback route handles Supabase OAuth callback
[ ] middleware.ts protects /dashboard, /shipments, /carriers, /drivers, /routes, /warehouses
[ ] Unauthenticated access to any protected route → /login
[ ] Sidebar renders with all 6 nav links
[ ] Active nav link highlighted
[ ] Header shows user name + avatar
[ ] Header dropdown has logout button
[ ] Logout → clears session → /login
[ ] MobileNav hamburger button visible at < 768px
[ ] Sidebar collapses on mobile
[ ] /dashboard loads stats cards
[ ] Stats cards show real numbers from DB (not hardcoded)
[ ] Recent shipments list shows last 5
```

**Phase 2 done when:** Full auth loop works + protected routes redirect + dashboard shows real data.

---

## PHASE 3 — Shipments (1:45–3:00)

**Codex prompt to use:** Prompt 3 from AGENT.md

```
[ ] /shipments loads with all 12 seed shipments visible
[ ] ShipmentTable shows: number, origin→dest, cargo type, weight, status badge, carrier
[ ] Status badges have correct colors per business.md
[ ] Search by shipment number works (debounced)
[ ] Search by origin city works
[ ] Search by destination city works
[ ] Status filter dropdown works
[ ] Empty state shows when no results match filter
[ ] "New Shipment" button visible (admin/dispatcher only)
[ ] Click table row → /shipments/[id]

[ ] /shipments/new form renders
[ ] All required fields validated client-side (Zod)
[ ] Carrier dropdown populated from DB
[ ] Driver dropdown populated (filtered by selected carrier)
[ ] Route dropdown populated from DB
[ ] Origin Warehouse dropdown populated from DB
[ ] Destination Warehouse dropdown populated from DB
[ ] Server action validates + inserts shipment
[ ] New shipment status defaults to 'draft'
[ ] Success → redirects to /shipments/[id]
[ ] Cancel → back to /shipments

[ ] /shipments/[id] shows all fields
[ ] Status badge correct color
[ ] Carrier section shows carrier details
[ ] Driver section shows driver details (if assigned)
[ ] Route section shows route details (if assigned)
[ ] Warehouse sections show (if assigned)
[ ] Tracking events timeline (newest first)
[ ] Status change button visible (admin/dispatcher)
[ ] Delete button with dialog (admin only)
[ ] Delete → removes shipment → redirects to /shipments
```

**Phase 3 done when:** Full CRUD flow works end-to-end with validation.

---

## PHASE 4 — Carriers + Drivers (3:00–3:45)

**Codex prompt to use:** Prompt 5 from AGENT.md

```
[ ] /carriers loads with all 10 seed carriers
[ ] CarrierTable: code, name, mode badge, contact, rating stars, status badge
[ ] Status filter works
[ ] Transport mode filter works

[ ] /drivers loads with all 8 seed drivers
[ ] DriverTable: name, license, expiry, phone, carrier name, vehicle, status badge
[ ] Status badge colors: available=green, on_trip=blue, off_duty=gray, suspended=red
[ ] Filter by status works
```

**Phase 4 done when:** Both list pages load with seed data and filters work.

---

## PHASE 5 — Routes + Warehouses (3:45–4:15)

**Codex prompt to use:** Prompt 6 from AGENT.md

```
[ ] /routes loads with all 8 seed routes
[ ] RouteTable: name, origin→dest, distance, est. hours, mode badge, toll, active status
[ ] Filter by mode works
[ ] Filter by active/inactive works

[ ] /warehouses loads with all 6 seed warehouses
[ ] WarehouseTable: code, name, city, state, capacity, status badge, manager
[ ] Status badge: active=green, inactive=gray, maintenance=amber
[ ] Filter by status works
```

**Phase 5 done when:** Both display pages load with seed data.

---

## PHASE 6 — AI Delay Badge (4:15–4:45)

**Codex prompt to use:** Prompt 4 from AGENT.md

```
[ ] /api/ai/delay-prediction POST endpoint responds
[ ] Returns correct shape: { risk, reason, confidence }
[ ] risk values are exactly: 'low' | 'medium' | 'high'
[ ] DelayPredictionBadge renders on in_transit shipments
[ ] DelayPredictionBadge renders on assigned shipments
[ ] Badge does NOT show on draft/confirmed/delivered/cancelled/delayed
[ ] green badge for 'low'
[ ] yellow badge for 'medium'
[ ] red badge for 'high'
[ ] Loading spinner shows while fetching
[ ] Hover tooltip shows reason + confidence %
[ ] If API errors → badge hidden silently (no error shown to user)
[ ] ANTHROPIC_API_KEY not visible in browser DevTools Network tab
```

**Phase 6 done when:** Badge renders on live shipments with correct colors and tooltip.

---

## PHASE 7 — Landing Page (4:45–5:00)

**Codex prompt to use:** Prompt 7 from AGENT.md

```
[ ] / route renders without auth
[ ] Hero with "NextGen TMS" headline
[ ] "Get Started" button → /register
[ ] "Login" button → /login
[ ] 6 feature highlights visible
[ ] Looks professional on desktop and mobile
```

---

## PHASE 8 — Polish + Deploy (5:00–6:00)

**Codex prompt to use:** Prompt 8 from AGENT.md

```
PRE-DEPLOY:
[ ] npm run build — 0 TypeScript errors, 0 build errors
[ ] Fix every error before deploying — do not deploy a broken build
[ ] Check 375px mobile — no horizontal scroll on any page
[ ] Check all pages load without console errors

DEPLOY:
[ ] GitHub MCP: check diff — .env.local NOT staged
[ ] GitHub MCP: commit all files with message "feat: complete NextGen TMS"
[ ] GitHub MCP: push to main
[ ] Vercel MCP: create project, connect repo, set env vars
[ ] Vercel MCP: trigger deployment
[ ] Get live Vercel URL

PRODUCTION VERIFICATION:
[ ] Live URL loads landing page
[ ] /login works on production
[ ] Register new user works on production
[ ] /dashboard loads with stats
[ ] /shipments loads with seed data
[ ] AI delay badge works on production
[ ] /carriers, /drivers, /routes, /warehouses all load
[ ] Logout works
[ ] No console errors in browser DevTools

SUPABASE AUTH SETUP (manual — do once):
[ ] Go to Supabase → Authentication → URL Configuration
[ ] Site URL: https://your-app.vercel.app
[ ] Redirect URLs: https://your-app.vercel.app/**, http://localhost:3000/**

FINAL:
[ ] Demo video recorded (use script from AGENT.md)
[ ] GitHub repo URL confirmed
[ ] Vercel live URL confirmed
[ ] Video URL confirmed
[ ] All 3 links submitted
```

---

## EMERGENCY RULES (if running behind)

If you hit 5:00 and Phase 8 is not started:
1. Skip polish — deploy whatever works
2. A working ugly app beats a broken pretty app
3. Priority order if cutting: Warehouses page → Routes page → Drivers page
4. AI badge is a differentiator — do NOT skip it
5. Shipments must work fully — it is the core feature judges will test

---
*NextGen TMS Platform — 6-hour build plan*