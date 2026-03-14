# UI/UX Standards — NextGen TMS Platform
> Codex reads this before building any component or page.

---

## DESIGN PHILOSOPHY

- Mobile-first — design for 375px, enhance for desktop
- Clean and functional — judges are technical, not designers
- Data visible immediately — no empty states on first load (seed data handles this)
- Consistent — same patterns everywhere, no surprises

---

## COLOR SYSTEM (Tailwind classes)

### Shipment Status Colors
```typescript
draft:      'bg-gray-100 text-gray-700 border-gray-200'
confirmed:  'bg-blue-100 text-blue-700 border-blue-200'
assigned:   'bg-purple-100 text-purple-700 border-purple-200'
in_transit: 'bg-amber-100 text-amber-700 border-amber-200'
delivered:  'bg-green-100 text-green-700 border-green-200'
delayed:    'bg-red-100 text-red-700 border-red-200'
cancelled:  'bg-gray-100 text-gray-400 border-gray-200 line-through'
```

### AI Badge Colors
```typescript
low:    'bg-green-100 text-green-700'
medium: 'bg-yellow-100 text-yellow-700'
high:   'bg-red-100 text-red-700'
```

### Transport Mode Colors
```typescript
truck:      'bg-orange-100 text-orange-700'
rail:       'bg-blue-100 text-blue-700'
air:        'bg-sky-100 text-sky-700'
ocean:      'bg-teal-100 text-teal-700'
intermodal: 'bg-purple-100 text-purple-700'
```

---

## LAYOUT

### Sidebar
- Width: `w-64` on desktop, hidden on mobile
- Background: `bg-gray-900` (dark sidebar like Linear/Vercel)
- Nav links: `text-gray-300 hover:text-white hover:bg-gray-800`
- Active link: `text-white bg-gray-800`
- Logo at top: "NextGen TMS" in white
- User info at bottom with avatar + name + logout

### Main Content Area
- Left padding for sidebar: `ml-64` on desktop, `ml-0` on mobile
- Content padding: `p-6`
- Max width for readability: `max-w-7xl mx-auto`

### Header
- Height: `h-16`
- Border bottom: `border-b border-gray-200`
- Page title on left, user avatar dropdown on right
- User dropdown: profile name + logout button

### Mobile Nav
- Hamburger button visible at `md:hidden`
- Sidebar slides in as sheet/drawer
- Overlay closes sidebar on click

---

## TYPOGRAPHY

- Page titles: `text-2xl font-bold text-gray-900`
- Section headings: `text-lg font-semibold text-gray-800`
- Table headers: `text-xs font-medium text-gray-500 uppercase tracking-wider`
- Body text: `text-sm text-gray-700`
- Muted text: `text-sm text-gray-500`
- Metadata (dates, IDs): `text-xs text-gray-400 font-mono`

---

## COMPONENTS

### Stats Card (dashboard)
```
┌─────────────────────────┐
│ Icon    Title            │
│         Large Number     │
│         Subtitle         │
└─────────────────────────┘
```
- Background: `bg-white border border-gray-200 rounded-lg p-6`
- Number: `text-3xl font-bold text-gray-900`
- Title: `text-sm font-medium text-gray-500`

### Status Badge
- `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`
- Colors from STATUS_COLORS constant in types/index.ts

### Table
- shadcn Table component
- Header: sticky, `bg-gray-50`
- Row hover: `hover:bg-gray-50 cursor-pointer`
- On mobile (< 768px): show cards instead of table OR enable horizontal scroll with `overflow-x-auto`
- Empty state: centered, icon + message + optional CTA button

### Form
- shadcn Card wrapper: `bg-white rounded-lg border p-6`
- Label above input always
- Error message below input in `text-red-500 text-sm`
- Submit button: right-aligned, shows spinner while pending
- Cancel button: secondary style, left of submit

### Delete Confirmation Dialog
```
Title: "Delete Shipment?"
Body: "This action cannot be undone. Shipment TMS-2026-001 will be permanently deleted."
Buttons: [Cancel] [Delete] (red)
```

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Behavior |
|---|---|
| < 768px (mobile) | Sidebar hidden, hamburger visible, tables → cards or scroll |
| 768px–1024px (tablet) | Sidebar visible but narrower |
| > 1024px (desktop) | Full layout, all columns visible |

### Mobile must-haves
- No horizontal scroll on any page at 375px
- Touch targets minimum 44x44px
- Font size never below 14px
- Forms stack vertically (not side by side)

---

## LOADING STATES

Every async operation needs a visual state:

```typescript
// Page-level: use Suspense with skeleton
<Suspense fallback={<TableSkeleton rows={5} />}>
  <ShipmentTable />
</Suspense>

// Button-level: use useTransition or form pending state
<Button disabled={isPending}>
  {isPending ? <Spinner /> : 'Create Shipment'}
</Button>

// AI badge: spinner while fetching, badge when done
```

---

## EMPTY STATES

Every list page needs an empty state component:

```
      [Icon]
  No shipments found
  Try adjusting your search or filters
  [New Shipment Button] (optional)
```

---

## WHAT NOT TO DO

- No dark mode (out of scope — consistent light mode only)
- No animations or transitions (wastes time, not judged)
- No custom fonts — use default Tailwind/system fonts
- No images — use lucide-react icons only
- No gradients or shadows except subtle card shadows
- No modal-heavy flows — prefer page navigation
- No skeleton loaders that are more complex than simple gray rectangles

---
*UI/UX v1.0 — NextGen TMS Platform*