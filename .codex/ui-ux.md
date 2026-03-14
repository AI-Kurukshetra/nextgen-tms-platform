# UI/UX Standards — NextGen TMS Platform
> Codex reads this before building any component or page.

---

## DESIGN PHILOSOPHY

- Mobile-first with premium visual direction
- Data-first but not plain: strong hierarchy, intentional color, and modern spacing
- Fast readability for ops teams with interactive cues
- Consistent components with purposeful motion and transitions

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
- Background: gradient dark panel
- Active nav item highlighted with accent tint
- User identity visible at bottom with quick logout

### Main Content Area
- Left padding for sidebar: `ml-64` on desktop, `ml-0` on mobile
- Soft gradient workspace background
- Content padding: `p-4` mobile, `p-6` desktop
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
- Hover lift and shadow transitions
- Icon badge with subtle scale animation

### Charts
- Dashboard must include visual KPIs (status distribution + monthly trend)
- Prefer lightweight Tailwind-based bars and progress visuals
- Keep charts responsive and legible at mobile width

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

## MOTION RULES

- Use subtle animations only where they improve clarity:
  - section reveal
  - card hover lift
  - progress/bar transitions
- Avoid continuous distracting animation loops

## WHAT NOT TO DO

- No heavy motion that blocks data readability
- No unstructured color usage without semantic meaning
- No image-heavy hero sections that reduce app performance
- No modal-heavy flows for core operational tasks

---
*UI/UX v1.0 — NextGen TMS Platform*
