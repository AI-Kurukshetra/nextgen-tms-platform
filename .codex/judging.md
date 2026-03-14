# Judging Checklist — NextGen TMS Platform
> Final validation checklist before demo/submission.

---

## FUNCTIONALITY

- [ ] Register/login/logout works end-to-end
- [ ] Dashboard KPIs load from DB
- [ ] Shipments list/search/filter works
- [ ] Shipment create + detail + status update + delete flow works
- [ ] Carriers/drivers/routes/warehouses pages load with data
- [ ] Delay risk badge renders on eligible statuses
- [ ] Tracking timeline and supporting shipment modules work
- [ ] Rates, inventory, invoicing pages load and compute correctly
- [ ] Customer portal and customer directory are accessible by proper roles

## SECURITY

- [ ] `.env.local` is not tracked
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Protected APIs return `401/403` without proper auth/role
- [ ] RLS remains enabled on core tables
- [ ] No server-only keys exposed in client/network payloads

## USABILITY

- [ ] Desktop and mobile nav flows are intact
- [ ] Tables are scroll-safe on small screens
- [ ] Loading/empty/error states are visible and clean
- [ ] No broken links from sidebar/mobile nav

## CODE QUALITY

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No placeholder/TODO text in production files
- [ ] Reused existing modules instead of duplicating logic

