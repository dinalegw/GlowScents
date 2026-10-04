require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production.');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (isProduction) app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));

app.use(session({
  name: 'glowscents.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

require('./data/db');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/', shopRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404', { user: req.session ? req.session.userName : null });
});

app.listen(PORT, () => {
  console.log(`Glow Scents is running at http://localhost:${PORT}`);
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP_USER and SMTP_PASS are not configured; email delivery is disabled.');
  }
  if (!process.env.OWNER_EMAIL) {
    console.warn('OWNER_EMAIL is not configured; admin access and owner notifications are disabled.');
  }
});
