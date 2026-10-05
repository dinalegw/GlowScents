# Glow Scents

Glow Scents is an Express/EJS storefront for premium oil perfumes and miniature fragrance sets. Customers can browse products, create an account, manage their profile, place a **pending manual order**, and view their own orders. The configured owner can view a basic admin dashboard.

## Current stack

- Node.js + Express 4
- EJS templates and static CSS/JavaScript
- `bcryptjs` password hashing and `express-session`
- Nodemailer/SMTP for order and contact emails
- LowDB JSON file store — development/demo only

## Local setup

1. Use Node.js 18 or later.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Copy the safe template and set local values:

   ```bash
   cp .env.example .env
   ```

4. Start the app:

   ```bash
   npm start
   ```

Open http://localhost:3000.

## Required configuration

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Long random secret. Required when `NODE_ENV=production`. |
| `OWNER_EMAIL` | Receives notifications and is the only account allowed into `/admin`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP delivery configuration. Use an app password or provider credential, never a normal email password. |
| `WA_NUMBER` | Optional WhatsApp number, numbers only. |

## Routes

- `/` — home
- `/catalog?cat=oil&q=oud` — searchable product catalogue
- `/product/:id` — product detail
- `/register`, `/login`, `/logout` — account session routes
- `/cart`, `/checkout` — signed-in shopping flow
- `/my-orders`, `/account` — signed-in customer pages
- `/order-success?id=:id` — only visible to the order owner
- `/admin` — owner-only dashboard
- `/contact` — contact form

## Order flow

The checkout route rebuilds the cart from the server-owned product catalogue. It does not accept browser-supplied prices, product names, or sizes. Orders are saved as `pending` and email delivery failure does not undo a successfully recorded order.

This is not yet a payment system. Do not charge customers until Paystack (or another provider) has been integrated with signed, idempotent webhook verification.

## Production status

**Do not deploy the current LowDB JSON data layer to Vercel.** Serverless instances do not provide reliable writable local storage, and the default in-memory session store is also unsuitable for production.

Before deployment, complete these items:

1. Replace `data/db.js` with managed Postgres (for example Neon) and checked-in migrations.
2. Use a durable session store.
3. Add CSRF protection, rate limiting, input schemas, and integration tests.
4. Integrate payment initiation and verified webhooks.
5. Configure SMTP sender/domain and production secrets in the host.
6. Remove committed `node_modules` and migrate/remove the tracked runtime JSON data without losing real users/orders.

See [docs/AUDIT.md](docs/AUDIT.md) for the confirmed findings and route inventory.

## Checks

The repository has a Node.js CI workflow. Run:

```bash
npm test
npm start
```

Automated application tests still need to be added after the database migration.