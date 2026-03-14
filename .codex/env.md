# Environment Variables — NextGen TMS Platform
> Canonical env contract for local and Vercel.

---

## REQUIRED

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Browser-safe Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Admin scripts/migrations only |
| `NEXT_PUBLIC_APP_URL` | Public | Canonical app URL override |
| `NEXT_PUBLIC_VERCEL_URL` | Public (Vercel auto) | Preview fallback URL |

---

## OPTIONAL (INTEGRATIONS)

| Variable | Scope | Purpose |
|---|---|---|
| `MAPBOX_API_KEY` or `GOOGLE_MAPS_API_KEY` | Public/Server (as needed) | Future map/routing enhancements |
| `EMAIL_PROVIDER_API_KEY` | Server-only | Future outbound email delivery |
| `SMS_PROVIDER_API_KEY` | Server-only | Future outbound SMS delivery |

---

## LOCAL TEMPLATE

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## SECURITY RULES

- Never commit `.env.local`.
- Never prefix service keys with `NEXT_PUBLIC_`.
- Never expose server-only keys in route responses.

