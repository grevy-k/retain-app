const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Everything here acts on the signed-in user's OWN account. The id always comes from the token.
router.use(requireAuth);

// PUT /api/account/profile: change the display name.
router.put('/profile', asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();

  if (!name) {
    return res.status(400).json({ message: 'Please enter your name.' });
  }
  if (name.length > 80) {
    return res.status(400).json({ message: 'Keep your name under 80 characters.' });
  }

  const result = await db.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
    [name, req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Account not found.' });
  }

  res.json({ user: result.rows[0] });
}));

// PUT /api/account/password: change the password. Needs the current one as proof.
router.put('/password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Your current and new password are both required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Your new password must be at least 8 characters.' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ message: 'Your new password must be different from the current one.' });
  }

  const found = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (found.rows.length === 0) {
    return res.status(404).json({ message: 'Account not found.' });
  }

  const matches = await bcrypt.compare(currentPassword, found.rows[0].password_hash);
  if (!matches) {
    // The current password is wrong, so we don't change it. We don't say which one is wrong, for security.
    return res.status(400).json({ message: 'Your current password is incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

  res.json({ message: 'Password updated.' });
}));

// DELETE /api/account: permanently delete the account and everything it owns.
router.delete('/', asyncHandler(async (req, res) => {
  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ message: 'Please enter your password to confirm.' });
  }

  const found = await db.query('SELECT password_hash, role FROM users WHERE id = $1', [req.user.id]);
  if (found.rows.length === 0) {
    return res.status(404).json({ message: 'Account not found.' });
  }

  const matches = await bcrypt.compare(password, found.rows[0].password_hash);
  if (!matches) {
    return res.status(400).json({ message: 'That password is incorrect.' });
  }

  // Never leave the platform without an admin.
  if (found.rows[0].role === 'admin') {
    const admins = await db.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'");
    if (admins.rows[0].count <= 1) {
      return res.status(400).json({
        message: "You're the only admin, so this account can't be deleted. Promote another admin first.",
      });
    }
  }

  // expenses and budgets are set to ON DELETE CASCADE, so they go with the user automatically.
  await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);

  res.json({ message: 'Account deleted.' });
}));

// A CSV cell must be quoted if it contains commas, quotes or line breaks.
function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);

  // If the cell starts with =, +, -, or @, Excel will treat it as a formula. Prepend a single quote to force it to be text.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  // Wrap cells containing commas, quotes or line breaks in quotes, doubling any quotes inside.
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;

  return text;
}

// GET /api/account/export: download this user's expenses as a CSV file.
router.get('/export', asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT e.spent_on, e.title, c.name AS category, e.amount, e.payment_method, e.notes
     FROM expenses e
     JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = $1
     ORDER BY e.spent_on DESC, e.id DESC`,
    [req.user.id]
  );

  const header = ['Date', 'Title', 'Category', 'Amount', 'Payment method', 'Notes'];
  const rows = result.rows.map((row) =>
    [row.spent_on, row.title, row.category, row.amount, row.payment_method, row.notes].map(csvCell).join(',')
  );
  const csv = [header.join(','), ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="retain-expenses.csv"');
  // The leading byte-order mark makes Excel read accents and symbols correctly.
  res.send('\uFEFF' + csv);
}));

module.exports = router;