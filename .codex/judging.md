# Judging Criteria Checklist — NextGen TMS Platform
> Run through this completely before recording the demo video.
> Every item maps to a specific judging criterion.

---

## JUDGING CRITERIA BREAKDOWN

| Criterion | Weight | What judges check |
|---|---|---|
| Product Hunt Ranking | Upvotes + comments on launch day |
| Functionality | Core features work, no critical bugs, usable end-to-end |
| Usability | Clean UI, intuitive flows, seed data visible, mobile-friendly |
| Code Quality | Clean structure, readable code, good practices |
| Code Security | No exposed secrets, input validation, auth implemented |
| Video Quality | Clear demo, good audio/video, follows 5-section template |

---

## CRITERION 1 — PRODUCT HUNT RANKING

For launch day:
- [ ] App name: "NextGen TMS"
- [ ] Tagline: "AI-powered transportation management for modern logistics"
- [ ] Description ready (3-4 sentences about the problem + solution)
- [ ] Landing page URL (your Vercel URL)
- [ ] Screenshots prepared (dashboard, shipments list, AI badge)
- [ ] Ask team/friends to upvote on launch day

---

## CRITERION 2 — FUNCTIONALITY

### Must work end-to-end:
```
[ ] Register new account → lands on dashboard
[ ] Login with existing account → lands on dashboard
[ ] Logout → lands on /login
[ ] Create new shipment with all fields → appears in list
[ ] View shipment detail → all fields shown
[ ] Update shipment status → status badge changes
[ ] Delete shipment → removed from list
[ ] Search shipments → filters correctly
[ ] Status filter → shows correct subset
[ ] Carriers page loads with data
[ ] Drivers page loads with data
[ ] Routes page loads with data
[ ] Warehouses page loads with data
[ ] Dashboard stats reflect real DB counts
[ ] AI delay badge appears on in_transit shipments
[ ] AI badge hover shows reason
```

### No critical bugs means:
- No 500 errors visible to user
- No blank white pages
- No "undefined" or "[object Object]" visible in UI
- No broken navigation links
- Forms submit without freezing

---

## CRITERION 3 — USABILITY

```
[ ] Seed data visible on every list page immediately — no empty states on first load
[ ] Status badges use correct colors (see ui-ux.md)
[ ] Every button has clear label
[ ] Every form has clear labels and placeholder text
[ ] Error messages are user-friendly ("Invalid email" not "auth/invalid-email")
[ ] Loading states visible on all async operations
[ ] Mobile 375px — test every page:
    [ ] Landing page
    [ ] /login
    [ ] /register
    [ ] /dashboard
    [ ] /shipments
    [ ] /shipments/new
    [ ] /shipments/[id]
    [ ] /carriers
    [ ] /drivers
    [ ] /routes
    [ ] /warehouses
[ ] No horizontal scroll at 375px on any page
[ ] Sidebar collapses on mobile with hamburger
[ ] Tables readable on mobile (card view or scroll)
[ ] Touch targets large enough (minimum 44px height on buttons)
```

---

## CRITERION 4 — CODE QUALITY

Things judges look at in the GitHub repo:

```
[ ] Consistent folder structure (matches AGENT.md)
[ ] No files dumped in root that should be in src/
[ ] TypeScript used everywhere — no .js files
[ ] No `any` types visible in source files
[ ] Component files are single-responsibility
[ ] Server actions in lib/actions/ (not inside components)
[ ] Validations in lib/validations/ (not inside components)
[ ] No dead code or commented-out code blocks
[ ] .env.example present with empty values
[ ] README.md explains what the project is and how to run it
[ ] Meaningful git commit messages (not "update" or "fix stuff")
```

Recommended commit message format:
```
feat: add shipment CRUD with status state machine
feat: add AI delay prediction badge
feat: add carrier and driver management
chore: add database schema with RLS policies
fix: resolve middleware redirect loop
```

---

## CRITERION 5 — CODE SECURITY

```
[ ] .env.local NOT in GitHub repo
    Verify: git ls-files | grep env  → should return only .env.example
[ ] SUPABASE_SERVICE_ROLE_KEY has NO NEXT_PUBLIC_ prefix
[ ] ANTHROPIC_API_KEY has NO NEXT_PUBLIC_ prefix
[ ] Neither key appears in browser DevTools → Network tab
[ ] RLS enabled on ALL 7 tables
    Verify in Supabase: select tablename, rowsecurity from pg_tables where schemaname='public'
    All 7 rows must show rowsecurity = true
[ ] /dashboard without auth → redirects to /login (not 500, not blank)
[ ] /api/ai/delay-prediction without auth → returns 401
[ ] All forms have both client-side AND server-side Zod validation
[ ] No hardcoded passwords or API keys anywhere in source files
```

---

## CRITERION 6 — VIDEO QUALITY

5-section template (4 minutes total):

```
SECTION 1 (0:00–0:30) — Problem + Solution
Show: Landing page at your Vercel URL
Say: "Managing freight operations manually is slow, error-prone, and costly.
NextGen TMS is an AI-powered transportation management system that gives
logistics teams real-time visibility and intelligent delay prediction."

SECTION 2 (0:30–1:15) — Auth + Dashboard
Show: Register with new email → dashboard loads
Show: 5 stats cards with real numbers
Say: "After signing up, dispatchers land on the dashboard showing
live statistics — total shipments, in transit, delivered, active carriers,
and available drivers."

SECTION 3 (1:15–2:30) — Core Feature Demo
Show: /shipments — seed data visible immediately
Show: Create new shipment — fill form — submit — appears in list
Show: Click into a shipment with status in_transit
Show: AI delay badge (green/yellow/red)
HOVER on badge — show tooltip with reason
Say: "The AI delay prediction badge is powered by Anthropic Claude.
It analyses the route, carrier, and schedule to flag shipments at risk
before they become problems."
Show: Status change dropdown — change status

SECTION 4 (2:30–3:15) — Supporting Modules
Show: /carriers — 10 carriers with ratings and mode badges
Show: /drivers — 8 drivers with status badges
Show: /routes — 8 routes with distance and time
Show: /warehouses — 6 warehouses with status
Say: "The platform also manages the full logistics network —
carriers, drivers, routes, and warehouses."

SECTION 5 (3:15–4:00) — Code Quality + Security
Show: GitHub repo — clean folder structure
Show: Supabase dashboard → Authentication → RLS enabled
Show: .env.example in repo — empty values, no secrets committed
Show: Mobile view at 375px — responsive layout
Say: "Built with Next.js 15, Supabase, and TypeScript.
Row Level Security on all 7 tables. No secrets in the repository.
Live at [your Vercel URL]."
```

### Video recording tips:
- Use Loom (loom.com) — free, instant share link
- Record at 1080p minimum
- Speak clearly and at normal pace
- Keep cursor movements deliberate — don't wave it around
- If you make a mistake, pause 3 seconds then continue — easy to trim
- Background: plain desktop, no notifications
- Test audio before recording

---

## FINAL SUBMISSION LINKS TO GATHER

```
[ ] Live URL:    https://_____________________________.vercel.app
[ ] GitHub URL:  https://github.com/___________________________
[ ] Video URL:   https://loom.com/share/____________________
[ ] Product Hunt: https://www.producthunt.com/posts/__________
```

---

## LAST-MINUTE CHECKS (5 minutes before submitting)

```
[ ] Open Vercel URL in incognito window — does it load?
[ ] Register a brand new account in incognito — does it reach dashboard?
[ ] Open /shipments — is seed data visible?
[ ] Open one shipment with in_transit status — does AI badge appear?
[ ] Open /carriers — data visible?
[ ] Resize browser to 375px — any horizontal scroll?
[ ] Open browser DevTools → Network — any 500 errors?
[ ] Check GitHub repo — is .env.local absent from file list?
[ ] Video link works and audio is clear?
[ ] All 3 submission links copied and ready?
```

---
*Judging v1.0 — NextGen TMS Platform*