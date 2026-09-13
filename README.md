# Mehr-E-Commerce-Backend

REST API for **MEHR**, a Pakistani fashion house storefront (women, kids, shawls). It powers the public shop, guest checkout, wishlist, contact desk, atelier chatbot, and the admin **Studio**.

Storefront: [Mehr-E-Commerce-frontend](https://github.com/sohail-brohi/Mehr-E-Commerce-frontend)

```
API  →  controller  →  service  →  model
```

---

## Features

### Catalogue
- Published product listing for the storefront
- Full catalogue for Studio (including drafts)
- Categories: `women`, `kids`, `shawls`
- Collections (Noor, Sang, Virsa) with slug, tagline, editorial image
- Product fields: price / sale price, sizes, colours, fabric, fit, care, origin, story
- Media: gallery images, 360 frames, optional 3D model URL, size guide
- Flags: featured, new arrival, published, sort order, live stock
- Admin CRUD + quick patch for stock / featured / new arrival / published

### Auth & accounts
- Register / login with JWT (`Bearer`)
- Password hashed with bcrypt (12 rounds)
- Profile read / update (name, phone)
- Forgot / reset password (SHA-256 token, 1 hour expiry)
- Role: `customer` or `admin`
- Email matching `ADMIN_EMAIL` is promoted to admin on register or login
- Auth endpoints rate-limited (8 / 15 min)

### Guest shopping
- Optional `X-Guest-Id` header (8–64 alphanumeric / hyphen)
- Guest bag, wishlist, and orders stay on that device id
- On register or login, guest orders attach to the user and wishlists merge
- IP is stored on the order for operations, not used as identity

### Checkout & orders
- Place order as guest or signed-in customer
- Line items priced from live published products (sale price if set)
- Stock decremented when available
- Qty clamped 1–10 per line
- Shipping amount from the client; total = subtotal + shipping
- Payment methods: `cod`, `card`, `wallet`, `bank`
- COD starts `unpaid`; other methods start `pending`
- Order number format: `MHR-######`
- Customer order history (`/mine`) by user id, email, or guest id
- Public track: order number + email
- Studio: list all orders, update status, notes, payment status
- Status flow: `Pending → Confirmed → Processing → Shipped → Delivered` (+ `Cancelled`)

### Wishlist
- Get / replace product id list (max 100)
- Separate documents for guest vs signed-in user
- Merged when a guest signs in

### Media
- Admin upload to S3-compatible storage (multer, 25 MB)
- Folder hint (`products`, etc.)
- Public URLs built from `S3_PUBLIC_URL`
- Seed script uploads catalogue stills to `catalogue/`

### Site desk
- Contact form → stored inbox + email to admin + acknowledgement to shopper
- Newsletter subscribe (unique email) + welcome email
- Public pay-to details (JazzCash, Easypaisa, bank / IBAN)
- Contact / newsletter rate-limited (6 / 15 min)

### Studio (admin)
- Overview: orders, today revenue, awaiting, unpaid, live pieces, low stock, unread inbox, subscribers, customers
- Customer list with order count and spend
- Promote / demote `admin` ↔ `customer` (cannot drop the house email, yourself, or the last admin)
- Inbox: list, mark read, delete
- Subscriber list
- Payment settings (JazzCash / Easypaisa / bank)

### Atelier chatbot
- Knowledge base for shipping, payments, sizing, try-on, exchanges, tracking, collections, etc.
- Live product search from the catalogue
- Order lookup when the shopper pastes `MHR-######` + email
- Optional OpenAI rewrite if `OPENAI_API_KEY` is set (otherwise local answers)
- Rate-limited (24 / 15 min)

### Email (Nodemailer)
When SMTP is configured:
- Welcome after register
- Password reset
- Order confirmation to the customer
- New-order alert to `ADMIN_EMAIL`
- Status change to the customer
- Contact form (admin + shopper)
- Newsletter welcome

If SMTP is empty, sends are skipped and logged.

---

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js, TypeScript (ESM) |
| HTTP | Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (`jsonwebtoken`), bcrypt |
| Files | AWS SDK S3, multer |
| Mail | Nodemailer |
| Dev | tsx watch, `tsc --noEmit` |

---

## Architecture

```
src/
  server.ts                 Process entry — connect DB, listen
  app.ts                    Express app, global middleware
  config/
    env.ts                  Typed environment
    constants.ts            Roles, statuses, rate limits, default pay-to
  api/                      Route tables only (verb + path + guards)
    index.ts
    auth.routes.ts
    product.routes.ts
    collection.routes.ts
    order.routes.ts
    wishlist.routes.ts
    media.routes.ts
    site.routes.ts
    studio.routes.ts
    chat.routes.ts
    health.routes.ts
  controllers/              Read req, write res — no business rules
  services/                 Use-cases, validation, mail, S3, chat
  models/                   Mongoose schemas
  middleware/               Auth, guest, rate limit, CORS, errors
  helpers/                  JWT, hash, slug, mappers, chat knowledge
  types/                    AuthedRequest
  database/
    connection.ts
    seed.ts                 Catalogue images + collections + products
```

| Layer | Owns |
|---|---|
| `api/` | URL map, `requireAuth` / `requireAdmin`, rate limits |
| `controllers/` | HTTP in / JSON out |
| `services/` | Rules, persistence, side effects |
| `helpers/` | JWT, hashing, slugs, DTO mappers |
| `middleware/` | Cross-cutting HTTP |
| `models/` | Documents |

---

## Getting started

**Needs:** Node.js 20+, MongoDB, S3-compatible bucket. SMTP is optional.

```sh
cd backend
npm i
copy .env.example .env
```

Fill `.env`, then:

```sh
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | Watch mode (`tsx watch src/server.ts`) |
| `npm start` | Production process |
| `npm run seed` | Upload seed images and upsert catalogue |
| `npm run typecheck` | `tsc --noEmit` |

- API: http://localhost:4000
- Health: http://localhost:4000/api/health
- Storefront (separate repo): http://localhost:5173 — Vite proxies `/api` here

---

## Docker (live)

The image listens on **3000** (Coolify `ports_exposes`). Secrets come from `.env` at **run** time — they are not baked into the image.

```sh
copy .env.example .env
# fill Mongo, JWT, S3, SMTP
docker compose up -d --build
```

- API: http://localhost:4000
- Health: http://localhost:4000/api/health

```sh
docker compose logs -f api
docker compose down
```

Build the image only:

```sh
docker build -t mehr-api .
docker run --env-file .env -e PORT=3000 -p 4000:3000 mehr-api
```

Set `CLIENT_URL` in `.env` to the live storefront origin so CORS and email links work.

**Coolify:** use the latest `main` commit (the image and `Dockerfile` live at the repo root). Build pack = Dockerfile. Do not set a base directory. On **General**, set **Ports Exposes** to `3000` and set the `PORT` env var to `3000` (not `4000`) or you will get a bad gateway.

| File | Role |
|---|---|
| `Dockerfile` | Production Node 22 Alpine image |
| `.dockerignore` | Keeps `.env`, `node_modules`, git out of the build |
| `docker-compose.yml` | Build, map host 4000 → container 3000, restart, health check |

---

## Environment

Copy `.env.example`. **Never commit `.env`.**

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | Mongo connection string |
| `JWT_SECRET` | yes | Signing key for access tokens |
| `JWT_EXPIRES_IN` | no | Default `7d` |
| `PORT` | no | Default `4000` |
| `HOST` | no | Bind address. Default `0.0.0.0` (needed in Docker) |
| `CLIENT_URL` | no | Storefront origin for CORS + email links. Default `http://localhost:5173` |
| `ADMIN_EMAIL` | no | House account that always gets Studio |
| `S3_ENDPOINT` | yes | S3-compatible endpoint |
| `S3_REGION` | no | Default `us-east-1` |
| `S3_BUCKET` | yes | Bucket name |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | yes | Credentials |
| `S3_FORCE_PATH_STYLE` | no | Default `true` |
| `S3_PUBLIC_URL` | yes | Public prefix for object URLs |
| `SMTP_HOST` | no | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | no | Default `587` |
| `SMTP_SECURE` | no | `true` for 465 |
| `SMTP_USER` / `SMTP_PASS` | no | Gmail: use an app password |
| `SMTP_FROM` | no | Must match the Gmail account if using Gmail |
| `OPENAI_API_KEY` | no | Enables LLM rewrite on chat |
| `OPENAI_MODEL` | no | Default `gpt-4o-mini` |
| `STRIPE_SECRET_KEY` | no | Enables Stripe Checkout for card orders |
| `STRIPE_WEBHOOK_SECRET` | no | `whsec_…` for `checkout.session.completed` |
| `STRIPE_CURRENCY` | no | Default `pkr` |
| `CORS_ORIGINS` | no | Extra comma-separated storefront origins |

CORS allows `CLIENT_URL`, `http://localhost:5173`, `http://127.0.0.1:5173`, and `CORS_ORIGINS` with credentials.

---

## Authentication

Send the JWT on protected routes:

```
Authorization: Bearer <token>
```

Guest identity (optional, any route):

```
X-Guest-Id: <8-64 chars, letters / numbers / hyphen>
```

| Guard | Behaviour |
|---|---|
| None / `optionalAuth` | Token used if valid; ignored if missing |
| `requireAuth` | 401 without a valid token |
| `requireAdmin` | 403 unless `role === "admin"` |

Register / login response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Sohail",
    "email": "you@example.com",
    "phone": "",
    "role": "customer",
    "isAdmin": false
  }
}
```

---

## API reference

Base path: `/api`. JSON unless noted. Errors: `{ "error": "message" }`.

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | public | `{ "ok": true, "service": "mehr-api" }` |

### Auth — `/api/auth`

Rate limit: 8 requests / 15 minutes on register, login, forgot, reset.

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| `POST` | `/register` | public | `name`, `email`, `password` (≥6), `phone?` → 201 + token |
| `POST` | `/login` | public | `email`, `password` |
| `GET` | `/me` | user | Current profile |
| `PATCH` | `/me` | user | `name`, `phone` |
| `POST` | `/forgot` | public | `email` — always `{ ok: true }` (no email leak) |
| `POST` | `/reset` | public | `token`, `password` (≥6) |

### Products — `/api/products`

Public list is **published only**. Admin list includes drafts.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | public | Published catalogue |
| `GET` | `/all` | admin | Every piece |
| `POST` | `/` | admin | Create (`name`, `slug`, `price` required) |
| `PUT` | `/:id` | admin | Full update |
| `PATCH` | `/:id` | admin | `stock`, `featured`, `new_arrival`, `published` |
| `DELETE` | `/:id` | admin | Remove |

Create / update body (snake_case for some fields):

```json
{
  "name": "Noor embroidered kurta",
  "slug": "noor-embroidered-kurta",
  "sku": "MHR-NR-001",
  "description": "...",
  "story": "...",
  "price": 28500,
  "sale_price": null,
  "category": "women",
  "collection_slug": "noor",
  "sizes": ["XS", "S", "M", "L", "XL"],
  "colors": [{ "name": "Ivory", "hex": "#F3EFE6" }],
  "images": ["catalogue/hero.jpg"],
  "frames_360": ["catalogue/hero.jpg"],
  "model_url": null,
  "size_guide_url": null,
  "fabric": "Silk organza",
  "fit": "Relaxed",
  "care": "Dry clean only",
  "origin": "Cut in Lahore",
  "stock": 14,
  "featured": true,
  "new_arrival": true,
  "published": true,
  "sort_order": 0
}
```

Responses map stored keys to public URLs (`images`, `frames360`, `modelUrl`, `sizeGuideUrl`) and keep raw paths (`imagePaths`, …).

### Collections — `/api/collections`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | public | All collections |
| `POST` | `/` | admin | `name` required; `slug`, `tagline`, `description`, `image_url`, `sort_order` |
| `PUT` | `/:id` | admin | Update |
| `DELETE` | `/:id` | admin | Remove |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/` | optional | Place order |
| `GET` | `/mine` | optional | Orders for this user / email / guest |
| `GET` | `/track/:orderNumber?email=` | public | Lookup by number + email |
| `GET` | `/` | admin | All orders |
| `PATCH` | `/:id/status` | admin | `status` |
| `PATCH` | `/:id/notes` | admin | `notes` (max 2000) |
| `PATCH` | `/:id/payment` | admin | `paymentStatus` |

### Payments — `/api/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/stripe/session` | optional | Create a Stripe Checkout session for a card order (`orderId`, optional `successUrl` / `cancelUrl`) |
| `GET` | `/stripe/session/:sessionId` | optional | Confirm a Checkout session and mark the order paid |
| `POST` | `/stripe/webhook` | Stripe signature | Raw-body webhook (`checkout.session.completed`) |

Place order:

```json
{
  "customerName": "Sohail Khan",
  "customerEmail": "you@example.com",
  "customerPhone": "03001234567",
  "addressLine1": "Street, block",
  "city": "Lahore",
  "postalCode": "54000",
  "shipping": 300,
  "paymentMethod": "cod",
  "paymentStatus": "unpaid",
  "paymentReference": null,
  "items": [
    { "productId": "...", "qty": 1, "size": "M", "color": "Ivory" }
  ]
}
```

Statuses: `Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`  
Payments: `unpaid`, `paid`, `pending`, `failed`, `refunded`  
Methods: `cod`, `card`, `wallet`, `bank`

### Wishlist — `/api/wishlist`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | optional | `{ "productIds": [] }` |
| `PUT` | `/` | optional | `{ "productIds": ["...", "..."] }` |

### Media — `/api/media`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/` | admin | `multipart/form-data`: `file`, optional `folder` |

Response: `{ "path": "products/uuid.jpg", "url": "https://…/products/uuid.jpg" }`

### Site — `/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/pay-to` | public | JazzCash, Easypaisa, bank title / name / IBAN |
| `POST` | `/contact` | public | `name`, `email`, message (≥8 chars) |
| `POST` | `/newsletter` | public | `email` |

Contact / newsletter: 6 / 15 min.

### Studio — `/api/studio`

All routes require admin.

| Method | Path | Description |
|---|---|---|
| `GET` | `/overview` | KPIs, recent orders, low-stock pieces |
| `GET` | `/customers` | Users + order count + spend |
| `PATCH` | `/customers/:id/role` | `{ "role": "admin" \| "customer" }` |
| `GET` | `/inbox` | Contact messages |
| `PATCH` | `/inbox/:id/read` | Mark read |
| `DELETE` | `/inbox/:id` | Delete message |
| `GET` | `/subscribers` | Newsletter list |
| `GET` | `/settings` | Pay-to |
| `PUT` | `/settings` | `{ "payTo": { jazzcash, easypaisa, bankTitle, bankName, iban } }` |

### Chat — `/api/chat`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/` | public | Last 12 turns, 24 / 15 min |

```json
{
  "messages": [
    { "role": "user", "content": "Do you ship to Karachi?" }
  ]
}
```

```json
{
  "reply": "We ship across Pakistan in 3–5 working days…",
  "links": [{ "label": "Shipping", "href": "/shipping" }],
  "products": [{ "name": "…", "slug": "…", "price": 28500, "image": "…", "category": "women" }]
}
```

Track from chat by including an `MHR-######` number and the order email in the thread.

---

## Data models

| Model | Purpose |
|---|---|
| `User` | Name, email, password hash, phone, role, reset token |
| `Product` | Catalogue piece |
| `Collection` | Editorial chapter |
| `Order` + items | Checkout snapshot (name, price, image at purchase) |
| `Wishlist` | Guest or user product ids |
| `ContactMessage` | Inbox (`read` flag) |
| `Subscriber` | Newsletter email |
| `Setting` | Studio pay-to (`key: "studio"`) |

Prices are **PKR integers**.

---

## Security

- `X-Powered-By` disabled; `trust proxy` on
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- JSON body limit 2 MB
- In-memory rate limits on auth, contact, newsletter, chat
- Passwords never stored in plain text; reset tokens stored as SHA-256
- Forgot-password always returns `{ ok: true }`
- Admin cannot remove the house email, their own Studio access, or the last admin
- Guest id is validated before attach
- `.env` is gitignored

---

## Seed

`npm run seed` uploads stills from `assets/` to S3 under `catalogue/` and upserts:

- Collections: **Noor**, **Sang**, **Virsa**
- 12 products across women, shawls, and kids (prices, stories, stock, 360 frames)

Safe to re-run (matches on slug).

---

## Emails

| Event | To |
|---|---|
| Register | New customer |
| Password reset | That email, if an account exists |
| Order placed | Customer + `ADMIN_EMAIL` |
| Order status change | Customer |
| Contact form | Admin + shopper |
| Newsletter | Subscriber |

Links in mail use `CLIENT_URL` (account, reset, studio, new arrivals).

Gmail: enable 2FA, create an app password, set `SMTP_FROM` to that same address.

---

## Frontend pairing

The Vite app proxies `/api` → `http://localhost:${API_PORT:-4000}`.

Typical shopper flow: browse published products → wishlist / bag (guest or user) → checkout → confirmation email → track with `MHR-` number.

Studio (`/admin` on the frontend) uses the same JWT with `role: admin`.
