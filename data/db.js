const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'glow-scents.json'));
const db = low(adapter);

// Set defaults
db.defaults({ users: [], orders: [], _userSeq: 0, _orderSeq: 0 }).write();

console.log('✅ Database ready (JSON store)');

// sqlite3-compatible wrapper
const wrapper = {

  
  get: (sql, params, cb) => {
    try {
      let row = null;
      if (sql.includes('FROM users WHERE email')) {
        row = db.get('users').find({ email: params[0] }).value() || null;
      } else if (sql.includes('FROM users WHERE id')) {
        row = db.get('users').find({ id: params[0] }).value() || null;
      } else if (sql.includes('FROM orders') && sql.includes('WHERE id')) {
        row = db.get('orders').find({ id: params[0] }).value() || null;
      }
      if (cb) cb(null, row);
    } catch(e) { if (cb) cb(e); }
  },
  all: (sql, params, cb) => {
    try {
      let rows = [];
      if (sql.includes('FROM orders WHERE user_id')) {
        rows = db.get('orders').filter({ user_id: params[0] })
          .orderBy(['created_at'], ['desc']).value();
      }
      if (cb) cb(null, rows);
    } catch(e) { if (cb) cb(e); }
  },
  run: (sql, params, cb) => {
    try {
      if (sql.startsWith('INSERT INTO users')) {
        const seq = (db.get('_userSeq').value() || 0) + 1;
        db.set('_userSeq', seq).write();
        const user = {
          id: seq,
          name: params[0], email: params[1], phone: params[2],
          address: params[3], city: params[4], state: params[5] || '',
          password: params[6],
          created_at: new Date().toISOString()
        };
        // Check unique email
        if (db.get('users').find({ email: params[1] }).value()) {
          const err = new Error('UNIQUE constraint failed: users.email');
          if (cb) cb.call({}, err); return;
        }
        db.get('users').push(user).write();
        if (cb) cb.call({ lastID: seq, changes: 1 }, null);

      } else if (sql.startsWith('INSERT INTO orders')) {
        const seq = (db.get('_orderSeq').value() || 0) + 1;
        db.set('_orderSeq', seq).write();
        const order = {
          id: seq,
          user_id: params[0], user_name: params[1], user_email: params[2],
          user_phone: params[3], delivery_address: params[4],
          delivery_city: params[5], delivery_state: params[6] || '',
          items: params[7], total: params[8], status: 'pending',
          notes: params[9] || '',
          created_at: new Date().toISOString()
        };
        db.get('orders').push(order).write();
        if (cb) cb.call({ lastID: seq, changes: 1 }, null);

      } else if (sql.startsWith('UPDATE users SET')) {
        // UPDATE users SET name=?, phone=?, address=?, city=?, state=? WHERE id=?
        db.get('users').find({ id: params[5] }).assign({
          name: params[0], phone: params[1],
          address: params[2], city: params[3], state: params[4]
        }).write();
        if (cb) cb.call({ changes: 1 }, null);
      } else {
        if (cb) cb.call({ lastID: 0, changes: 0 }, null);
      }
    } catch(e) { if (cb) cb.call({}, e); }
  }
};

module.exports = wrapper;
