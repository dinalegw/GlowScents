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
  - Enable 2-Step Verification first, then create an App Password

### 4. Start the Server
```
npm start
```
Open your browser at **http://localhost:3000**

---

## 📁 Project Structure

```
glow-scents/
├── server.js           ← Main app entry point
├── package.json
├── .env.example        ← Rename to .env and fill in
├── data/
│   ├── db.js           ← SQLite database setup
│   ├── products.js     ← All 16 products (edit to add more)
│   └── mailer.js       ← Email notification system
├── middleware/
│   └── auth.js         ← Login/session guards
├── routes/
│   ├── auth.js         ← Register, Login, Logout
│   └── shop.js         ← Catalog, Cart, Checkout, Orders
├── views/              ← EJS templates (HTML pages)
│   ├── index.ejs       ← Home page
│   ├── catalog.ejs     ← Shop all products
│   ├── product.ejs     ← Single product page
│   ├── cart.ejs        ← Shopping cart
│   ├── checkout.ejs    ← Checkout form
│   ├── order-success.ejs
│   ├── register.ejs
│   ├── login.ejs
│   ├── my-orders.ejs
│   ├── account.ejs
│   └── partials/
│       ├── header.ejs
│       ├── footer.ejs
│       └── product-card.ejs
└── public/
    ├── css/style.css   ← All styles
    └── js/cart.js      ← Cart logic
```

---

## 🛒 How It Works

1. **Customer visits** the site and browses the catalog
2. **Adds items** to cart (stored in browser localStorage)
3. **Registers** with name, email, phone, and delivery address
4. **Places order** at checkout
5. **You receive an email** with:
   - Customer name, email, phone number
   - Full delivery address
   - All items ordered with quantities and prices
   - Order total
6. **Customer also receives** a confirmation email

---

## 🌐 Hosting Options

### Option A: Railway (Recommended — Free Tier Available)
1. Create an account at https://railway.app
2. Click "New Project" → "Deploy from GitHub" (or upload directly)
3. Set environment variables in Railway dashboard (same as your .env)
4. Railway auto-detects Node.js and deploys

### Option B: Render (Free Tier)
1. Create account at https://render.com
2. New Web Service → upload your code
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in the dashboard

### Option C: VPS (DigitalOcean, Hetzner, etc.)
1. Upload files via SFTP
2. Run `npm install` on the server
3. Use PM2 to keep it running: `npm install -g pm2 && pm2 start server.js`
4. Use Nginx as a reverse proxy

> ⚠️ **Important for hosting:** Set `cookie: { secure: true }` in server.js if using HTTPS

---

## 🛍️ Adding Products

Edit `data/products.js` to add, remove, or edit products. Each product has:
```javascript
{
  id: 17,                    // Unique number
  name: "My New Scent",
  category: "oil",           // "oil" or "miniature"
  price: 7000,               // Price in Naira (no ₦ symbol)
  size: "12ml",
  description: "...",
  notes: {
    top: "Rose, Bergamot",
    mid: "Jasmine",
    base: "Musk, Sandalwood"
  },
  badge: "New",              // "Bestseller", "New", "Premium", "Limited", "Gift Set", or null
  stock: 30
}
```

---

## 📊 Viewing Orders (Admin)

Orders are stored in `data/glow-scents.db` (SQLite). To view them:
- Install DB Browser for SQLite: https://sqlitebrowser.org
- Open `data/glow-scents.db`
- Browse the `orders` table

Or you can add an admin panel later.

---

Built with ❤️ for Glow Scents — Premium Oil Perfumes & Miniatures
