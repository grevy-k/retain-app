require('dotenv').config();

// Fail fast, with a clear message, if the server can't possibly work.
// Much easier to debug than a confusing crash on the first request.
const missing = ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL'].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is too short for production. Use at least 32 random characters.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const adminRoutes = require('./routes/admin');
const accountRoutes = require('./routes/account');

const app = express();

// On a host like Render every request comes through a proxy. Trusting the first proxy makes
// req.ip the real visitor's address, which the rate limiter below depends on.
app.set('trust proxy', 1);

// Standard security headers (and removes the X-Powered-By header).
app.use(helmet());

// Only the Retain frontend may call this API from a browser.
// Trailing slashes are stripped: a stray "/" in CLIENT_URL is a common mistake that breaks CORS.
app.use(cors({ origin: process.env.CLIENT_URL.replace(/\/+$/, '') }));
app.use(express.json());

// Slows down password guessing: at most 30 sign-in or sign-up attempts per visitor every 15 minutes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

// Quick check that the server and database are both alive.
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    // Log the real reason to the terminal; the client only sees a generic status.
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'database unreachable' });
  }
});

// Only sign-in and sign-up are limited. /auth/me runs on every page load and must stay unrestricted.
app.use('/api/auth/signin', authLimiter);
app.use('/api/auth/signup', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/admin', adminRoutes); // admin-only: guarded inside routes/admin.js
app.use('/api/account', accountRoutes); // the signed-in user's own account

// Anything that didn't match a route above.
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Central error handler: asyncHandler sends unexpected errors here.
// The user gets a safe message; the real error is logged for us.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

// Default matches the PORT=5001 we set in .env.
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Retain API running on port ${port}`));