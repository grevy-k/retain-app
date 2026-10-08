const { Pool } = require('pg');
require('dotenv').config();
.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production, we need to tell the database client to accept the self-signed certificate that Heroku uses
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, 
};