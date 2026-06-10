# 🌟 Glow Scents — Premium Oil Perfumes & Miniatures

A full-stack e-commerce web app for Glow Scents. Customers can browse the catalog, register, place orders, and you get notified by email with their full details (name, phone, address).

---

## 🚀 Quick Start (Local)

### 1. Install Node.js
Download and install Node.js (v18 or later) from https://nodejs.org

### 2. Install Dependencies
Open a terminal in this folder and run:
```
npm install
```

### 3. Configure Email
Copy the example env file:
```
cp .env.example .env
```
Then open `.env` and fill in:
- `OWNER_EMAIL` — your email address (where orders will be sent)
- `SMTP_USER` — your Gmail address
- `SMTP_PASS` — your Gmail App Password (NOT your normal password)
  - Get one at: https://myaccount.google.com/apppasswords
  # 🌟 Glow Scents — Premium Oil Perfumes & Miniatures

  This repository contains a small e-commerce Node.js app for Glow Scents. It supports browsing a product catalog, user registration, cart/checkout flows, order notifications via email, and a lightweight admin dashboard.

  ## What I changed/added
  - Added `/about` and `/contact` pages and a contact form that emails the owner.
  - WhatsApp floating button (configurable via `WA_NUMBER` env var).
  - Basic admin dashboard at `/admin` protected by owner email (see env var `OWNER_EMAIL`).
  - Mobile CSS improvements and accessibility tweaks.
  - A proper contact flow and small UI polish for header/footer.

  ---

  ## Quick Start (Local)

  1. Install Node.js v18+ and Git.
  2. Clone this repo and change into folder:

  ```bash
  npm install
  cp .env.example .env
  ```

  3. Edit `.env` and set at minimum:
  - `SMTP_USER` and `SMTP_PASS` — for sending emails.
  - `OWNER_EMAIL` — where order and contact emails should be sent.
  - Optional: `WA_NUMBER` — international phone digits for WhatsApp (e.g. `2348000000000`).

  4. Run the app:

  ```bash
  npm start
  ```

  Open http://localhost:3000

  ---

  ## New Pages & Routes
  - `/about` — About Glow Scents
  - `/contact` (GET/POST) — Contact form (sends email to `OWNER_EMAIL`)
  - `/admin` — Basic admin dashboard (requires login and `OWNER_EMAIL` match; fallback: first user)

  ## Admin Access
  The admin route is protected by `middleware/auth.js` and checks the logged-in user's email against `OWNER_EMAIL`. If `OWNER_EMAIL` is not set, the first user (id 1) will be allowed as a fallback admin for convenience when testing locally.

  ---

  ## Contact Form
  The contact form sends messages to the `OWNER_EMAIL` using the same SMTP configuration used for order emails. The mailer function `sendContactMessage` is in `data/mailer.js`.

  ---

  ## WhatsApp Floating Button
  Set `WA_NUMBER` in `.env` (numbers only, e.g. `2348000000000`) to enable the WhatsApp chat link. The button is visible on all pages and opens a chat to that number.

  ---

  ## File Overview
  See the main structure of the app in the repository root. Important files:
  - `server.js` — application entry
  - `routes/` — route handlers (auth, shop, admin)
  - `views/` — EJS templates (partial header/footer, pages)
  - `public/css/style.css` — main stylesheet (includes WA styles)
  - `data/mailer.js` — email helpers

  ---

  ## Deploying / Hosting
  Same options as before: Railway, Render, or a VPS. Ensure env variables are set in your hosting environment:
  - `SMTP_USER`, `SMTP_PASS`, `OWNER_EMAIL`, optional `WA_NUMBER`, `SESSION_SECRET`.

  When deploying to production with HTTPS, set `cookie.secure = true` in `server.js` and ensure the `SESSION_SECRET` is a strong secret.

  ---

  If you'd like, I can now:
  - run a quick audit (lint/static checks),
  - run the app and open a browser preview,
  - or create a zip archive of the project ready for download.

  Tell me which next action you want.
4. Use Nginx as a reverse proxy
