# Environment Variables — NextGen TMS Platform
> All variables, where they live, and URL management across local/Vercel.

---

## ALL VARIABLES

| Variable | Prefix | Used In | Where Set |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | client + server | .env.local + Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | client + server | .env.local + Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | none (server-only) | server actions only | .env.local + Vercel |
| `NEXT_PUBLIC_APP_URL` | public | lib/config.ts | .env.local + Vercel (prod only) |
| `ANTHROPIC_API_KEY` | none (server-only) | API route only | .env.local + Vercel |
| `NEXT_PUBLIC_VERCEL_URL` | public | lib/config.ts | Auto-set by Vercel |

---

## .env.local (local machine only — NEVER commit)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get Supabase values from: Supabase Dashboard → Project Settings → API
Get Anthropic key from: console.anthropic.com → API Keys

---

## .env.example (committed to GitHub — empty values)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=
```

---

## URL MANAGEMENT — lib/config.ts

Never hardcode URLs. Always import `APP_URL` from this file.

```typescript
// src/lib/config.ts
export const APP_URL = (() => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  return 'http://localhost:3000'
})()
```

| Environment | Which variable wins | Result |
|---|---|---|
| Local dev | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| Vercel preview | `NEXT_PUBLIC_VERCEL_URL` (auto) | `https://nextgen-tms-abc123.vercel.app` |
| Vercel production | `NEXT_PUBLIC_APP_URL` (set in dashboard) | `https://nextgen-tms-platform.vercel.app` |

---

## VERCEL DASHBOARD SETUP

Go to: Vercel → Your Project → Settings → Environment Variables

Add these (select all 3 environments: Production, Preview, Development):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `ANTHROPIC_API_KEY` | your Anthropic key |
| `NEXT_PUBLIC_APP_URL` | https://your-app.vercel.app (Production only) |

Leave `NEXT_PUBLIC_APP_URL` blank for Preview — Vercel auto-sets `NEXT_PUBLIC_VERCEL_URL`.

---

## SUPABASE AUTH URL CONFIG (manual step after deploy)

Supabase → Authentication → URL Configuration:

```
Site URL:
https://your-app.vercel.app

Redirect URLs (add all):
https://your-app.vercel.app/**
https://your-app.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

Without this, login/register will fail on production.

---

## SECURITY REMINDERS

- `SUPABASE_SERVICE_ROLE_KEY` — never `NEXT_PUBLIC_`. Has admin DB access.
- `ANTHROPIC_API_KEY` — never `NEXT_PUBLIC_`. Exposes paid API account.
- Run `git ls-files | grep env` to verify .env.local is not tracked.
- Run `git diff --cached` before every commit to verify no secrets staged.

---
*Env v1.0 — NextGen TMS Platform*