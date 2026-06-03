# Admin side — orientation for AI agents

This folder customizes the **Payload CMS admin** (`/admin`). It is the project's one and
only management panel. Do **not** build admin UI as a separate Next.js route (a `/panel`
attempt was rejected) and not in `app/(frontend)/_legacy-admin` (that `_`-prefixed folder is
**private / not routed** — it only survives as importable helpers + server actions).

## How Payload admin customization works here

`payload.config.ts` → `admin.components` wires everything:

```
admin.components = {
  graphics: { Logo, Icon },                 // app/(payload)/admin/graphics/*
  beforeNavLinks: ["…/NavBrand.tsx"],       // brand block atop the sidebar
  afterNavLinks:  ["…/AdminNavLinks.tsx"],  // extra "Operations" sidebar links
  views: {
    dashboard: { Component: "…/DashboardView.tsx" },          // overrides /admin home
    scanner:   { Component: "…/ScannerView.tsx",  path: "/scanner"  },
    activity:  { Component: "…/ActivityView.tsx", path: "/activity" },
    settings:  { Component: "…/SettingsView.tsx", path: "/settings" },
  },
}
```

Payload owns the **sidebar / header / chrome**. We only supply **content** (views) and
**nav links**. Component paths in config are resolved through `importMap.js` (generated).

## File map (this folder)

| File | What it is |
|---|---|
| `DashboardView.tsx` | `/admin` home. Server component: KPI cards + charts. Data via `getPayloadClient` + `getPgPool`. |
| `charts/DashboardCharts.tsx` | `"use client"` ApexCharts (revenue area, sales donut). Dynamic-imported `ssr:false`. |
| `ActivityView.tsx` + `ActivityTable.tsx` | `/admin/activity` — paid tickets + merch orders timeline (server view + client table w/ search+filter). |
| `SettingsView.tsx` | `/admin/settings` — account card, sign-out (`/admin/logout`), config links. |
| `ScannerView.tsx` | `/admin/scanner` — embeds `_legacy-admin/scan/ScannerClient`. |
| `NavBrand.tsx` / `AdminNavLinks.tsx` | sidebar brand / extra nav links. Plain CSS using Payload theme vars. |
| `graphics/` | Logo + Icon. |
| `importMap.js` | **Generated — do not hand-edit.** Maps config component paths → imports. |
| `../custom.scss` | Payload-admin-specific CSS overrides (loaded by `app/(payload)/layout.tsx`). |

## Styling

- **Tailwind v4 works inside the Payload admin** — `app/(payload)/layout.tsx` imports
  `(frontend)/globals.css`. Build views with Tailwind utilities (see `DashboardView.tsx`).
- For pieces rendered *inside Payload's own chrome* (nav links, brand), prefer plain styles
  with Payload theme vars: `var(--theme-elevation-…)`, etc. (see `NavBrand.tsx`).
- **Never import Bootstrap or the Velzon template CSS** — it clashes with Tailwind + Payload.
  Velzon HTML (`../../../../Dashboard-Template-Velzon`) is a *visual reference only*.
- Charts: only `react-apexcharts`, always `"use client"` + `dynamic(import, { ssr:false })`
  (ApexCharts touches `window`). Aggregate data in the server view, pass plain props down.

## Data

- Read through the Payload Local API helpers in `lib/`:
  `getPayloadClient()`, `getPgPool()` ([lib/payload.ts]), `listSoldTickets`, `listProductOrders`,
  `lib/tickets`, `lib/products`, `lib/message-broker`.
- Counts/filters → `payload.count/find({ collection, where })`. Aggregates (SUM, GROUP BY) or
  atomic updates → raw SQL via `getPgPool().query(...)` (snake_case tables: `sold_tickets`,
  `product_orders`, `products_sizes`, `tickets`, `message_jobs`).
- IDs: `sold_tickets/product_orders/joker_tickets` use a **text PK** (the QR code);
  `tickets/products/message_jobs` use uuid.

## Auth (two systems — don't confuse them)

- **Payload admin** (`/admin`) uses Payload **user** accounts. Login `/admin/login`,
  logout `/admin/logout`. Create/reset a local user: `npx payload run scripts/create-admin.ts`.
- **Custom gate** (`lib/admin-auth.ts`, cookie `ts21_admin`, `ADMIN_PASSWORD` env) guards the
  public `/api/*` routes and the legacy server actions — separate from Payload user auth.

## Add a new admin view (checklist)

1. Create `app/(payload)/admin/<Name>View.tsx` (server component; fetch via `lib/*`).
2. Client interactivity (tables/charts) → separate `"use client"` child, plain-prop interface.
3. Register in `payload.config.ts` → `admin.components.views.<name> = { Component: "/app/(payload)/admin/<Name>View.tsx", path: "/<name>" }`.
4. Add a link in `AdminNavLinks.tsx`.
5. `npx payload run scripts/…` not needed, but **`npx payload generate:importmap`** IS required
   (env: `DATABASE_URL`, `PAYLOAD_SECRET`).
6. `npm run build` (+ `npm test`), then commit. Verify authed: login via
   `POST /payload-api/users/login`, then `GET /admin/<name>` → 200.

## Gotchas

- Payload **API is mounted at `/payload-api`** (not `/api`) — see `routes.api` in config.
- After changing any config-referenced component, **regenerate `importMap.js`** or the view 500s.
- `npm run build` runs full TS typecheck on `scripts/**` too — keep migration/util scripts typed.
- Media is stored in **Vercel Blob** in prod (plugin in config, `BLOB_READ_WRITE_TOKEN`); local
  dev without the token falls back to disk (`public/media`, gitignored).

See also: root `AGENTS.md`, and the porting plan at
`../../../../Dashboard-Template-Velzon/PORT-TO-TBILISISTYLE21.md`.
