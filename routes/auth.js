const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../data/db');
const { redirectIfAuth } = require('../middleware/auth');

function safeReturnPath(value) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\\\')
    ? value
    : '/catalog';
}

router.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null, success: null, formData: {} });
});

router.post('/register', redirectIfAuth, async (req, res) => {
  const { name, email, phone, address, city, state, password, confirm_password } = req.body;

  if (!name || !email || !phone || !address || !city || !password) {
    return res.render('register', { error: 'All fields are required.', success: null, formData: req.body });
  }
  if (password !== confirm_password) {
    return res.render('register', { error: 'Passwords do not match.', success: null, formData: req.body });
  }
  if (password.length < 8) {
    return res.render('register', { error: 'Password must be at least 8 characters.', success: null, formData: req.body });
  }

  try {
    const hashed = await bcrypt.hash(password, 12);
    db.run(
      'INSERT INTO users (name, email, phone, address, city, state, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), phone.trim(), address.trim(), city.trim(), (state || '').trim(), hashed],
      function(err) {
        if (err) {
          const error = err.message && err.message.includes('UNIQUE')
            ? 'Email already registered. Please log in.'
            : 'Registration failed. Try again.';
          return res.render('register', { error, success: null, formData: req.body });
        }
        req.session.regenerate((sessionError) => {
          if (sessionError) {
            return res.render('register', { error: 'Registration failed. Try again.', success: null, formData: req.body });
          }
          req.session.userId = this.lastID;
          req.session.userName = name.trim();
          return res.redirect('/catalog?welcome=1');
        });
      }
    );
  } catch {
    res.render('register', { error: 'Something went wrong. Try again.', success: null, formData: req.body });
  }
});

router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: req.query.msg || null, formData: {} });
});

router.post('/login', redirectIfAuth, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Email and password required.', formData: req.body });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid email or password.', formData: req.body });
    }

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.render('login', { error: 'Invalid email or password.', formData: req.body });
      }
      const returnTo = safeReturnPath(req.session.returnTo);
      req.session.regenerate((sessionError) => {
        if (sessionError) {
          return res.render('login', { error: 'Unable to start a session. Try again.', formData: req.body });
        }
        req.session.userId = user.id;
        req.session.userName = user.name;
        return res.redirect(returnTo);
      });
    } catch {
      return res.render('login', { error: 'Unable to sign in. Try again.', formData: req.body });
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('glowscents.sid');
    res.redirect('/');
  });
});

module.exports = router;
