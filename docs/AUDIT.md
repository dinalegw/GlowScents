# GlowScents audit

## Architecture
GlowScents is an Express 4 + EJS fragrance catalogue and manual-order application. Product data is code-defined in `data/products.js`; user and order records use LowDB with the tracked `data/glow-scents.json` file. Authentication is email/password with `bcryptjs` and `express-session`. Email is sent through SMTP/Nodemailer.

## Confirmed high-impact findings

| Impact | Finding | Evidence | Status |
| --- | --- | --- | --- |
| Critical | Checkout trusted browser-supplied prices, quantities, names, and sizes. | `routes/shop.js` calculated totals from `req.body.cart`. | Fixed: server rebuilds every order from the trusted product catalogue. |
| High | Session used a committed default secret and insecure production cookie settings. | `server.js` had a fallback secret and `secure: false`. | Fixed: production requires `SESSION_SECRET`; secure cookies, proxy trust, httpOnly and SameSite are configured. |
| High | The first registered account became admin when `OWNER_EMAIL` was absent. | `middleware/auth.js`. | Fixed: only the configured owner can administer the shop. |
| High | Stored JSON database was unsafe for multi-instance/serverless production. | `data/db.js`, `data/glow-scents.json`. | Fixed in code and Neon: the app now uses Postgres; schema migration applied to the isolated `glowscents` database. Legacy JSON data still needs a reviewed import before it is deleted. |
| High | Real payment confirmation is absent. Orders are recorded as pending on checkout. | `routes/shop.js`. | Unresolved business integration: use Paystack test/live webhooks before charging customers. |
| Medium | Login redirect was not restricted to local paths. | `routes/auth.js`. | Fixed: safe local redirect validation. |
| Medium | Order success route accepted arbitrary IDs. | `routes/shop.js`. | Fixed: order ownership is checked before rendering. |
| Medium | Email HTML interpolated customer values directly. | `data/mailer.js`. | Fixed: all customer-controlled HTML is escaped before templating. |
| Medium | No automated tests exist. | `package.json`. | Pending: add integration tests after database replacement. |
| Medium | `node_modules` is committed. | Repository tree includes `node_modules/`. | Pending cleanup: remove with a dedicated review because it is a large destructive repository operation. |

## Route inventory

| Route | Method | Audience | Dependencies | Result / coverage |
| --- | --- | --- | --- | --- |
| `/` | GET | Public | Product data | Rendered home; manual source review only |
| `/catalog` | GET | Public | Product data | Filter/search; manual source review only |
| `/product/:id` | GET | Public | Product data | Needs input validation/404 response |
| `/register`, `/login` | GET/POST | Public | Session, JSON DB | Source-reviewed; production rate limiting/CSRF still required |
| `/logout` | GET | Signed-in | Session | Should become POST with CSRF protection |
| `/cart`, `/checkout` | GET/POST | Signed-in | Session, JSON DB, mail | Server-side price validation fixed; not live-tested |
| `/order-success`, `/my-orders` | GET | Signed-in | Session, JSON DB | Ownership check added to success route; not live-tested |
| `/account` | GET/POST | Signed-in | Session, JSON DB | Requires validation and CSRF |
| `/admin` | GET | Owner | Session, JSON DB | Owner-only check fixed; no audit log yet |
| `/contact` | GET/POST | Public | SMTP | Fails honestly if SMTP missing; no rate limit/CSRF |

## Vercel assessment
The application data layer now targets the isolated `glowscents` Neon Postgres database. Before Vercel production deployment, set `DATABASE_URL` in Vercel, migrate legacy JSON records if needed, configure a durable session store, add real payment verification, and configure SMTP sender/domain plus production secrets.

## Baseline verification
A local clone could not be obtained in this execution environment because its network proxy was unavailable, so runtime/browser checks and `npm ci` could not be performed. Source was inspected through the connected GitHub repository. The fixes on this branch are static-review changes and require CI/runtime verification after checkout.

## Remaining priorities
1. Import legacy JSON records into Postgres if they contain real customer data, then remove the JSON store.
2. Add a durable session store, Paystack checkout plus signed idempotent webhook verification.
3. Add CSRF protection, rate limits, input schemas and automated integration tests.
4. Remove committed `node_modules` in a dedicated cleanup PR.
5. Set Vercel environment variables and deploy after steps 1–3.
