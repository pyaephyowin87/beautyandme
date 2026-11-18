# Beauty & Me Shop — Standalone (Render)

A standalone, deployable copy of the Beauty & Me test shop (Phase 1), built
as plain project files for **Render free tier**. Node.js + Express serves a
static single-page frontend and a JSON API. No Muse artifact code is used —
this was rebuilt from the approved spec.

## Run locally

```bash
npm install
npm run seed     # rebuild data/products.json, coupons, payments from POS data
npm start        # serves on http://localhost:3000
```

## File tree

```
shop-standalone/
  server.js            Express app: static public/ + /api
  lib/store.js         Storage: JSON files in data/ by default;
                       Postgres when DATABASE_URL is set (tables auto-created,
                       seeded from the JSON files on first start)
  scripts/seed.js      POS → products seed (dedupe + variation grouping)
  data/
    pos-source.json    The POS export (491 rows, 2026-11-18) — price is truth
    products.json      Seeded catalog (402 products, 51 with options)
    coupons.json       TEST10 = 10% off (test coupon)
    payments.json      9 primary Htet Htet Aung accounts
    orders.json        Orders (runtime data, gitignored)
    users.json         Accounts (runtime data, gitignored)
    settings.json      WooCommerce keys + app links (runtime, gitignored)
    uploads/           Payment screenshots (runtime, gitignored)
  public/
    index.html  app.js  styles.css   Single-page shop (Burmese-first, MY/EN)
    logo.png           Circular BM badge (transparent)
  render.yaml          Render Blueprint: Node web service (free) + Postgres (free)
  package.json         express + pg, engines node 20, start: node server.js
  .gitignore
  README.md            This file
  DEPLOY-RENDER.md     Tap-by-tap Burmese deploy guide for Render
```

## Data rules (Pyae's rules, enforced in code)

- **POS price is the truth.** Seed: 491 POS rows → 402 products (2 duplicate
  names merged keeping the in-stock entry; variation rows grouped into one
  product with options — 51 products, 137 options total).
- **Never show stock quantity to customers** — only "Stock ရှိပါတယ်" /
  "ကုန်ပြီ" (`in_stock` boolean). Quantities exist only in Manage responses.
- **Delivery fee is NEVER in the order Total.** Total = products only minus
  discounts. Fee is a separate line: Yangon inner 4,000 / outer 4,500 Ks,
  "ပို့ခ X Ks — ပစ္စည်းရောက်မှ ပေးပါ"; outside Yangon = shop calls to confirm;
  store pickup = 0 Ks, Cash on Collection within 3 days.
- **Transfer orders REQUIRE a payment screenshot** — the Place Order button
  is disabled without one, and the server refuses (`400 screenshot_required`).
  COD needs no screenshot. Screenshots are saved to `data/uploads/`.
- **Orders never change product stock** — POS controls stock.
- **Manage is gated to phone 095117366 only** (register with that phone;
  `is_manager` flag). All other accounts get 403 on `/api/manage/*`.
- **WooCommerce is read-only.** Preview first (match by SKU, then normalized
  name), Import only on tap. WooCommerce-only items are skipped. Keys come
  from env vars (`WC_SITE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) or
  the Manage UI — never in chat, never in files; the UI shows only
  `••••` + last 4 chars.

## API (summary)

- `GET /api/products?q=&brand=&section=best|new|sale` — fuzzy multi-keyword
  search (name, brand, category **and option labels**)
- `GET /api/products/:id`, `GET /api/brands`, `GET /api/shop-info`
- `POST /api/auth/register|login`, `GET /api/me` (Bearer token)
- `POST /api/coupons/validate`, `GET /api/payments`
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`
- Manage (`/api/manage/*`, manager only): stats, products (with quantities),
  coupons, payments, app-links, WooCommerce settings/test/preview/import

## Environment variables

| Var | Required | Notes |
|---|---|---|
| `PORT` | No (default 3000) | Render sets it automatically |
| `DATABASE_URL` | No | Set by `render.yaml` from the free Postgres; without it, JSON files are used |
| `WC_SITE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` | No | WooCommerce read-only creds; also settable in Manage |

## Seed flags (heuristics — editable in Manage)

- `best_seller` (12): BeBreeze Serum Tonic + 3D Ampoule + 10 highest-stock
  items across COSRX / ANUA / KUNDAL / P.CALM.
- `is_new` (34): all BEBREEZE + P.CALM items.
- `sale_price`: null everywhere at seed — the Sale section stays hidden until
  a sale price is set in Manage.
- BeBreeze skin-type notes are seeded (Strawberry = all types, Chestnut =
  oily/combination/acne, others = all types). No SPF/PA claims anywhere.

## Known limits

- **Render free web service sleeps after 15 min idle** — first visit after
  idle takes ~1 min to wake. Upgrade to $7/mo Starter to stay always on.
- **Render free Postgres expires** — check the expiry in the Render
  dashboard and back up (or upgrade to paid $6/mo) before it ends.
- **Disk data is ephemeral on Render free** — JSON files (`data/orders.json`,
  `data/users.json`, `data/uploads/`) are lost on redeploy/restart. With the
  Blueprint's Postgres attached, orders/accounts live in Postgres and survive.
  (Locally, JSON files persist.)
- **No product images yet** — all 402 products show the "ပုံ မရှိသေးပါ"
  placeholder until WooCommerce Preview + Import pulls image URLs.
- **ABOUT TONE pact #02 Light / #03 Natural** stay as separate products
  (no shared size suffix to group by) — group manually in Manage later if
  wanted.
- **WooCommerce Preview/Import not live-tested** — no credentials were
  available during the build; test with real keys in Manage after deploy.
- Password minimum is 4 characters; login tokens last 30 days.

## Deploy

See [DEPLOY-RENDER.md](DEPLOY-RENDER.md) (Burmese, tap-by-tap).
