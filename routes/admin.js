const express = require('express');
const router = express.Router();
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { requireAdmin } = require('../middleware/auth');

const adapter = new FileSync(path.join(__dirname, '..', 'data', 'glow-scents.json'));
const db = low(adapter);

authCheck = [requireAdmin];

// GET /admin — basic dashboard
router.get('/', authCheck, (req, res) => {
  const users = db.get('users').value() || [];
  const orders = db.get('orders').orderBy(['created_at'], ['desc']).value() || [];

  res.render('admin', {
    user: req.session.userName || null,
    stats: {
      users: users.length,
      orders: orders.length,
    },
    recentOrders: orders.slice(0, 10)
  });
});

module.exports = router;
