function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login?msg=Please+log+in+to+continue');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/catalog');
  }
  return next();
}

const db = require('../data/db');

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login?msg=Please+log+in+to+continue');
  }

  const owner = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
  if (!owner) {
    return res.status(503).send('Admin access is not configured.');
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user || !user.email || user.email.toLowerCase() !== owner) {
      return res.status(403).send('Forbidden');
    }
    return next();
  });
}

module.exports = { requireAuth, redirectIfAuth, requireAdmin };
