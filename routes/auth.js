const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../data/db');
const { redirectIfAuth } = require('../middleware/auth');

// GET /register
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null, success: null, formData: {} });
});

// POST /register
router.post('/register', redirectIfAuth, async (req, res) => {
  const { name, email, phone, address, city, state, password, confirm_password } = req.body;

  if (!name || !email || !phone || !address || !city || !password) {
    return res.render('register', { error: 'All fields are required.', success: null, formData: req.body });
  }
  if (password !== confirm_password) {
    return res.render('register', { error: 'Passwords do not match.', success: null, formData: req.body });
  }
  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters.', success: null, formData: req.body });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, phone, address, city, state, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), phone.trim(), address.trim(), city.trim(), (state||'').trim(), hashed],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.render('register', { error: 'Email already registered. Please log in.', success: null, formData: req.body });
          }
          return res.render('register', { error: 'Registration failed. Try again.', success: null, formData: req.body });
        }
        req.session.userId = this.lastID;
        req.session.userName = name.trim();
        res.redirect('/catalog?welcome=1');
      }
    );
  } catch (e) {
    res.render('register', { error: 'Something went wrong. Try again.', success: null, formData: req.body });
  }
});

// GET /login
router.get('/login', redirectIfAuth, (req, res) => {
  const msg = req.query.msg || null;
  res.render('login', { error: msg, formData: {} });
});

// POST /login
router.post('/login', redirectIfAuth, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Email and password required.', formData: req.body });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid email or password.', formData: req.body });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Invalid email or password.', formData: req.body });
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    const returnTo = req.session.returnTo || '/catalog';
    delete req.session.returnTo;
    res.redirect(returnTo);
  });
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
