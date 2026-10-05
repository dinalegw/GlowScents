const express = require('express');
const router = express.Router();
const products = require('../data/products');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');
const { sendOrderNotification, sendOrderConfirmation, sendContactMessage } = require('../data/mailer');

function currentUser(req) {
  return req.session.userName || null;
}

function validateCart(rawCart) {
  let requestedItems;
  try {
    requestedItems = JSON.parse(rawCart);
  } catch {
    return { error: 'Your cart could not be read. Please try again.' };
  }

  if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 20) {
    return { error: 'Your cart is empty or invalid.' };
  }

  const quantities = new Map();
  for (const item of requestedItems) {
    const id = Number(item && item.id);
    const qty = Number(item && item.qty);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      return { error: 'Your cart contains an invalid product or quantity.' };
    }
    quantities.set(id, (quantities.get(id) || 0) + qty);
  }

  const items = [];
  for (const [id, qty] of quantities) {
    const product = products.find((candidate) => candidate.id === id);
    if (!product || qty > product.stock) {
      return { error: 'One or more items are unavailable in the requested quantity.' };
    }
    items.push({ id: product.id, name: product.name, size: product.size, price: product.price, qty });
  }

  return { items, total: items.reduce((sum, item) => sum + item.price * item.qty, 0) };
}

router.get('/', (req, res) => {
  const featured = products.filter((p) => p.badge === 'Bestseller').slice(0, 4);
  res.render('index', { user: currentUser(req), featured });
});

router.get('/catalog', (req, res) => {
  const cat = ['oil', 'miniature'].includes(req.query.cat) ? req.query.cat : null;
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  let filtered = [...products];

  if (cat) filtered = filtered.filter((p) => p.category === cat);
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }

  res.render('catalog', {
    products: filtered,
    user: currentUser(req),
    activeFilter: cat || 'all',
    searchQuery: q
  });
});

router.get('/product/:id', (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) return res.status(404).render('404', { user: currentUser(req) });

  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).render('404', { user: currentUser(req) });

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  res.render('product', { product, related, user: currentUser(req) });
});

router.get('/cart', requireAuth, (req, res) => {
  res.render('cart', { user: req.session.userName });
});

router.get('/checkout', requireAuth, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) return res.redirect('/login');
    return res.render('checkout', { user: req.session.userName, userData: user, error: null });
  });
});

router.post('/checkout', requireAuth, (req, res) => {
  const { delivery_address, delivery_city, delivery_state, notes, cart } = req.body;
  const cartResult = validateCart(cart);
  if (cartResult.error) {
    return res.redirect('/cart?error=' + encodeURIComponent(cartResult.error));
  }

  const address = (delivery_address || '').trim().slice(0, 300);
  const city = (delivery_city || '').trim().slice(0, 100);
  const state = (delivery_state || '').trim().slice(0, 100);
  const safeNotes = (notes || '').trim().slice(0, 1000);
  if (!address || !city) return res.redirect('/checkout?error=delivery');

  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (userError, user) => {
    if (userError || !user) return res.redirect('/login');

    db.run(
      'INSERT INTO orders (user_id, user_name, user_email, user_phone, delivery_address, delivery_city, delivery_state, items, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.phone, address, city, state, JSON.stringify(cartResult.items), cartResult.total, safeNotes],
      async function(orderError) {
        if (orderError) {
          console.error('Order insert error:', orderError.message);
          return res.redirect('/checkout?error=1');
        }

        const orderData = {
          id: this.lastID, user_name: user.name, user_email: user.email, user_phone: user.phone,
          delivery_address: address, delivery_city: city, delivery_state: state,
          items: JSON.stringify(cartResult.items), total: cartResult.total, notes: safeNotes, created_at: new Date().toISOString()
        };

        try {
          await Promise.all([sendOrderNotification(orderData), sendOrderConfirmation(orderData, user.email)]);
        } catch (mailError) {
          console.error('Order email error:', mailError.message);
        }

        return res.redirect('/order-success?id=' + orderData.id);
      }
    );
  });
});

router.get('/order-success', requireAuth, (req, res) => {
  const orderId = Number(req.query.id);
  if (!Number.isInteger(orderId)) return res.redirect('/my-orders');

  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err || !order || order.user_id !== req.session.userId) return res.status(404).render('404', { user: currentUser(req) });
    return res.render('order-success', { user: req.session.userName, orderId: order.id });
  });
});

router.get('/my-orders', requireAuth, (req, res) => {
  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId], (err, orders = []) => {
    const safeOrders = err ? [] : orders.map((order) => {
      try { return { ...order, items: JSON.parse(order.items) }; } catch { return { ...order, items: [] }; }
    });
    res.render('my-orders', { user: req.session.userName, orders: safeOrders });
  });
});

router.get('/account', requireAuth, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, userData) => {
    res.render('account', { user: req.session.userName, userData: userData || {}, success: req.query.saved });
  });
});

router.post('/account', requireAuth, (req, res) => {
  const { name, phone, address, city, state } = req.body;
  if (![name, phone, address, city].every((value) => typeof value === 'string' && value.trim())) {
    return res.redirect('/account?error=validation');
  }
  db.run('UPDATE users SET name=?, phone=?, address=?, city=?, state=? WHERE id=?',
    [name.trim().slice(0, 100), phone.trim().slice(0, 40), address.trim().slice(0, 300), city.trim().slice(0, 100), (state || '').trim().slice(0, 100), req.session.userId],
    (err) => {
      if (!err) req.session.userName = name.trim().slice(0, 100);
      res.redirect('/account?saved=1');
    });
});

router.get('/about', (req, res) => res.render('about', { user: currentUser(req) }));

router.get('/contact', (req, res) => {
  res.render('contact', { user: currentUser(req), success: null, error: null, form: {} });
});

router.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.render('contact', { user: currentUser(req), success: null, error: 'Please provide name, email and message.', form: req.body });
  }

  sendContactMessage({
    name: String(name).trim().slice(0, 100), email: String(email).trim().slice(0, 254),
    phone: String(phone || '').trim().slice(0, 40), message: String(message).trim().slice(0, 2000)
  })
    .then(() => res.render('contact', { user: currentUser(req), success: 'Message sent. We will reply soon.', error: null, form: {} }))
    .catch((err) => {
      console.error('Contact mail error:', err.message);
      res.render('contact', { user: currentUser(req), success: null, error: 'Failed to send message. Try again later.', form: req.body });
    });
});

module.exports = router;
