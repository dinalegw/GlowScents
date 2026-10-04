const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Configure Neon Postgres before starting GlowScents.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

function placeholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function initialize() {
  await pool.query('SELECT 1');
  console.log('Postgres database ready');
}

const db = {
  initialize,
  async get(sql, params, callback) {
    try {
      const result = await pool.query(placeholders(sql), params);
      callback(null, result.rows[0] || null);
    } catch (error) {
      callback(error);
    }
  },
  async all(sql, params, callback) {
    try {
      const result = await pool.query(placeholders(sql), params);
      callback(null, result.rows);
    } catch (error) {
      callback(error);
    }
  },
  async run(sql, params, callback) {
    try {
      let query = placeholders(sql);
      if (/^\s*INSERT\b/i.test(query) && !/\bRETURNING\b/i.test(query)) {
        query += ' RETURNING id';
      }
      const result = await pool.query(query, params);
      callback.call({ lastID: result.rows[0] ? result.rows[0].id : 0, changes: result.rowCount }, null);
    } catch (error) {
      callback.call({}, error);
    }
  },
  close: () => pool.end()
};

module.exports = db;
