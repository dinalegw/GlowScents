function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login?msg=Please+log+in+to+continue');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/catalog');
  }
  next();
}

const db = require('../data/db');

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login?msg=Please+log+in+to+continue');
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) return res.status(403).send('Forbidden');

    const owner = (process.env.OWNER_EMAIL || '').toLowerCase();
    if (owner && user.email && user.email.toLowerCase() === owner) return next();

    // fallback: allow first user (id === 1) when OWNER_EMAIL not configured
    if (!owner && user.id === 1) return next();

    return res.status(403).send('Forbidden');
  });
}

module.exports = { requireAuth, redirectIfAuth, requireAdmin };
