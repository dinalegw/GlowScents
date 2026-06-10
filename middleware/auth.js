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

module.exports = { requireAuth, redirectIfAuth };
