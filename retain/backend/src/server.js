require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const adminRoutes = require('./routes/admin');
const accountRoutes = require('./routes/account');

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
    // Log the real reason to the terminal; the client only sees a generic status.
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'database unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/admin', adminRoutes); // admin-only: guarded inside routes/admin.js
app.use('/api/account', accountRoutes); 

// Anything that didn't match a route above.
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Catch-all error handler. Any route can throw an error, and it will end up here.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Retain API running on port ${port}`));