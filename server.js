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
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/', shopRoutes);
app.use('/admin', adminRoutes);

// ── 404 ───────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { user: req.session ? req.session.userName : null });
});

// ── Start ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌟 Glow Scents is running at http://localhost:${PORT}`);
  console.log(`📧 Owner email: ${process.env.OWNER_EMAIL || '(not set — configure .env)'}`);
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP_USER and SMTP_PASS are not configured. Emails cannot be sent until these are provided.');
  }
  if (!process.env.OWNER_EMAIL) {
    console.warn('⚠️ OWNER_EMAIL is not configured. Order and contact emails have no recipient.');
  }
  console.log(`\nPages:`);
  console.log(`   Home     → http://localhost:${PORT}/`);
  console.log(`   Catalog  → http://localhost:${PORT}/catalog`);
  console.log(`   Register → http://localhost:${PORT}/register`);
  console.log(`   Login    → http://localhost:${PORT}/login\n`);
});
