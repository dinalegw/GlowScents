// Load env variables
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── View Engine ──────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static Files ─────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Body Parsers ──────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Session ───────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'glow-scents_secret_dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// ── Init DB ───────────────────────────────
require('./data/db');

// ── Routes ────────────────────────────────
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

app.use('/', authRoutes);
app.use('/', shopRoutes);

// ── 404 ───────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>Page Not Found — Glow Scents</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Jost&display=swap" rel="stylesheet">
    </head>
    <body style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a0a00,#3d1f00);font-family:'Jost',sans-serif;text-align:center;">
      <div>
        <p style="color:#d4a843;font-size:80px;margin:0;">404</p>
        <h1 style="font-family:'Cormorant Garamond',serif;color:#faf6f0;font-size:32px;margin:10px 0;">Page Not Found</h1>
        <p style="color:#8a7060;margin-bottom:28px;">The page you're looking for doesn't exist.</p>
        <a href="/" style="background:#d4a843;color:#1a0a00;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Go Home</a>
      </div>
    </body>
    </html>
  `);
});

// ── Start ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌟 Glow Scents is running at http://localhost:${PORT}`);
  console.log(`📧 Owner email: ${process.env.OWNER_EMAIL || '(not set — configure .env)'}`);
  console.log(`\nPages:`);
  console.log(`   Home     → http://localhost:${PORT}/`);
  console.log(`   Catalog  → http://localhost:${PORT}/catalog`);
  console.log(`   Register → http://localhost:${PORT}/register`);
  console.log(`   Login    → http://localhost:${PORT}/login\n`);
});
