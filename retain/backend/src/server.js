require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
const categoryRoutes = require('./routes/categories');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Quick check that the server and database are both alive.
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./db');
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'database unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// Anything that didn't match a route above.
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Central error handler: asyncHandler sends unexpected errors here.
// The user gets a safe message; the real error is logged for us.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Retain API running on port ${port}`));