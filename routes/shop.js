const express = require('express');
const router = express.Router();
const products = require('../data/products');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');
const { sendOrderNotification, sendOrderConfirmation } = require('../data/mailer');

// GET / — Home page
router.get('/', (req, res) => {
  const featured = products.filter(p => p.badge === 'Bestseller').slice(0, 4);
  res.render('index', {
    user: req.session.userName || null,
    featured
  });
});

// GET /catalog
router.get('/catalog', (req, res) => {
  const { cat, q } = req.query;
  let filtered = [...products];

  if (cat === 'oil') filtered = filtered.filter(p => p.category === 'oil');
  else if (cat === 'miniature') filtered = filtered.filter(p => p.category === 'miniature');

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  res.render('catalog', {
    products: filtered,
    user: req.session.userName || null,
    activeFilter: cat || 'all',
    searchQuery: q || ''
  });
});

// GET /product/:id
router.get('/product/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.redirect('/catalog');

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  res.render('product', {
    product,
    related,
    user: req.session.userName || null,
  });
});

// GET /cart
router.get('/cart', requireAuth, (req, res) => {
  res.render('cart', { user: req.session.userName });
});

// GET /checkout
router.get('/checkout', requireAuth, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) return res.redirect('/login');
    res.render('checkout', { user: req.session.userName, userData: user, error: null });
  });
});

// POST /checkout
router.post('/checkout', requireAuth, async (req, res) => {
  const { delivery_address, delivery_city, delivery_state, notes, cart } = req.body;

  let cartItems;
  try {
    cartItems = JSON.parse(cart);
  } catch {
    return res.redirect('/cart');
  }

  if (!cartItems || cartItems.length === 0) return res.redirect('/cart');

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) return res.redirect('/login');

    db.run(
      `INSERT INTO orders (user_id, user_name, user_email, user_phone, delivery_address, delivery_city, delivery_state, items, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id, user.name, user.email, user.phone,
        delivery_address || user.address,
        delivery_city || user.city,
        delivery_state || user.state,
        JSON.stringify(cartItems),
        total,
        notes || ''
      ],
      async function(err) {
        if (err) {
          console.error('Order insert error:', err);
          return res.redirect('/checkout?error=1');
        }

        const orderId = this.lastID;
        const orderData = {
          id: orderId,
          user_name: user.name,
          user_email: user.email,
          user_phone: user.phone,
          delivery_address: delivery_address || user.address,
          delivery_city: delivery_city || user.city,
          delivery_state: delivery_state || user.state,
          items: JSON.stringify(cartItems),
          total,
          notes: notes || '',
          created_at: new Date().toISOString()
        };

        // Send emails (don't block the response)
        try {
          await sendOrderNotification(orderData);
          await sendOrderConfirmation(orderData, user.email);
        } catch (mailErr) {
          console.error('Email error (order still placed):', mailErr.message);
        }

        res.redirect('/order-success?id=' + orderId);
      }
    );
  });
});

// GET /order-success
router.get('/order-success', requireAuth, (req, res) => {
  const orderId = req.query.id;
  res.render('order-success', { user: req.session.userName, orderId });
});

// GET /my-orders
router.get('/my-orders', requireAuth, (req, res) => {
  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.session.userId],
    (err, orders) => {
      if (err) orders = [];
      orders = orders.map(o => ({ ...o, items: JSON.parse(o.items) }));
      res.render('my-orders', { user: req.session.userName, orders });
    }
  );
});

// GET /account
router.get('/account', requireAuth, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, userData) => {
    res.render('account', { user: req.session.userName, userData: userData || {}, success: req.query.saved });
  });
});

// POST /account
router.post('/account', requireAuth, (req, res) => {
  const { name, phone, address, city, state } = req.body;
  db.run(
    'UPDATE users SET name=?, phone=?, address=?, city=?, state=? WHERE id=?',
    [name, phone, address, city, state, req.session.userId],
    (err) => {
      if (!err) req.session.userName = name;
      res.redirect('/account?saved=1');
    }
  );
});

module.exports = router;
