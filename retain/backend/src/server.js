require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const adminRoutes = require('./routes/admin');

const app = express();

// Only the Retain frontend may call this API from a browser.
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Quick check that the server and database are both alive.
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    // The database is unreachable.
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'database unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/admin', adminRoutes); // admin-only guarded inside routes/admin.js

// Anything that didn't match a route above.
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Catch-all error handler. This is the last middleware, so it only runs if no route handled the request.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

// Start the server. The port is set by the environment (Render, Heroku, etc.) or defaults to 5001 for local development.
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Retain API running on port ${port}`));