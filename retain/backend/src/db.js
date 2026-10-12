const { Pool } = require('pg');
require('dotenv').config();

// Create a new PostgreSQL connection pool.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // exported so we can run transactions later (category deletion)
};