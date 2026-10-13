const { Pool, types } = require('pg');
require('dotenv').config();


types.setTypeParser(1082, (value) => value);

// A pool reuses connections instead of opening a new one per request.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Hosted databases (Neon, Render) require SSL; local ones don't.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // exported so we can run transactions (category deletion)
};