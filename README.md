# Veliscos App

Next.js 14 + Supabase rebuild of the Veliscos skincare storefront and admin portal.
Replaces the static HTML/JS app in the parent directory once Phase 6 ships.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Deploys to Vercel

## Local setup

```bash
# from the veliscos-app/ directory
npm install
npm run dev
```

Opens at <http://localhost:3000>. Env values live in `.env.local` (gitignored).

## Environment variables

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Public; safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public; safe to expose. |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | **Secret.** Used for admin scripts, migrations, RLS bypass. Never expose to client. |

## Phases

- [x] **Phase 0 — Setup.** Project skeleton, Tailwind, Supabase client, Vercel-ready.
- [ ] **Phase 1 — Storefront.** Port catalog, shop, product detail, cart, public pages.
- [ ] **Phase 2 — Checkout + Orders.** Order API with server-side stock + promo validation.
- [ ] **Phase 3 — Auth + Roles.** Replace PIN system with Supabase Auth + RLS.
- [ ] **Phase 4 — Admin core.** Dashboard, orders, products, customers, marketing.
- [ ] **Phase 5 — Admin financials.** Partners, expenses, settlements, activity log.
- [ ] **Phase 6 — Launch.** Domain, production env, backups, final QA.

## Project structure

```
veliscos-app/
  src/
    app/                  # Next.js routes (App Router)
      layout.tsx
      page.tsx
      globals.css
    lib/
      supabase.ts         # Supabase client singleton
  public/                 # static assets (populated in Phase 1)
  .env.local              # local env (gitignored)
  .env.example            # template
```
