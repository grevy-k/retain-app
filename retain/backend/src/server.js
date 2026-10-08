require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Only the Retain frontend may call this API from a browser.
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

// Catch-all for any other routes. Returns 404.
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Retain API running on port ${port}`));