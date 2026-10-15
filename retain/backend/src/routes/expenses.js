const express = require('express');
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Every expense route needs a signed-in user.
router.use(requireAuth);
router.param('id', (req, res, next, id) => {
  if (!/^\d{1,9}$/.test(id)) {
    return res.status(404).json({ message: 'Expense not found.' });
  }
  next();
});

const PAYMENT_METHODS = ['cash', 'card', 'mobile_money', 'bank_transfer', 'other'];

// Only these sort options are allowed. The client sends a key,
// and we pick the SQL ourselves so nothing from the user reaches ORDER BY.
const SORT_OPTIONS = {
  date_desc: 'e.spent_on DESC, e.id DESC',
  date_asc: 'e.spent_on ASC, e.id ASC',
  amount_desc: 'e.amount DESC, e.id DESC',
  amount_asc: 'e.amount ASC, e.id ASC',
};

// Checks the body of a create/update request. Returns an error string or null.
function validateExpense(body) {
  if (!body.title || !body.title.trim()) return 'Title is required.';
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return 'Amount must be a number greater than 0.';
  if (!body.categoryId) return 'Please choose a category.';
  if (!body.spentOn || Number.isNaN(Date.parse(body.spentOn))) return 'A valid date is required.';
  if (!PAYMENT_METHODS.includes(body.paymentMethod)) return 'Please choose a valid payment method.';
  return null;
}

// Column list reused by every query so the response shape is identical everywhere.
const EXPENSE_COLUMNS = `
  e.id, e.title, e.amount::float AS amount, e.spent_on AS "spentOn",
  e.payment_method AS "paymentMethod", e.notes, e.category_id AS "categoryId",
  c.name AS "categoryName"`;

// GET /api/expenses — list, with filters, pagination and sorting.  
router.get('/', asyncHandler(async (req, res) => {
  const { search, categoryId, paymentMethod, from, to, minAmount, maxAmount } = req.query;

  // Always scope to the signed-in user. This is the privacy guarantee.
  const conditions = ['e.user_id = $1'];
  const params = [req.user.id];

  // Each filter adds a condition and a parameter. $n numbers come from params.length.
  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(`(e.title ILIKE $${params.length} OR e.notes ILIKE $${params.length})`);
  }
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`e.category_id = $${params.length}`);
  }
  if (paymentMethod) {
    params.push(paymentMethod);
    conditions.push(`e.payment_method = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`e.spent_on >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`e.spent_on <= $${params.length}`);
  }
  if (minAmount) {
    params.push(minAmount);
    conditions.push(`e.amount >= $${params.length}`);
  }
  if (maxAmount) {
    params.push(maxAmount);
    conditions.push(`e.amount <= $${params.length}`);
  }

  const where = conditions.join(' AND ');
  const orderBy = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.date_desc;

  // Pagination: page and limit are optional query params. Defaults: page 1, limit 10. Max limit 50.
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const offset = (page - 1) * limit;

  // Count total matching rows for pagination info. Then fetch the requested page.
  const countResult = await db.query(`SELECT COUNT(*)::int AS total FROM expenses e WHERE ${where}`, params);
  const total = countResult.rows[0].total;

  const listParams = [...params, limit, offset];
  const result = await db.query(
    `SELECT ${EXPENSE_COLUMNS}
     FROM expenses e
     JOIN categories c ON c.id = e.category_id
     WHERE ${where}
     ORDER BY ${orderBy}
     LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  );

  res.json({
    expenses: result.rows,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}));

// GET /api/expenses/:id — a single expense, only if it belongs to this user.
router.get('/:id', asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT ${EXPENSE_COLUMNS}
     FROM expenses e JOIN categories c ON c.id = e.category_id
     WHERE e.id = $1 AND e.user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) {
    // The expense either doesn't exist or belongs to a different user. We don't say which, for privacy.
    return res.status(404).json({ message: 'Expense not found.' });
  }
  res.json({ expense: result.rows[0] });
}));

// POST /api/expenses
router.post('/', asyncHandler(async (req, res) => {
  const problem = validateExpense(req.body);
  if (problem) return res.status(400).json({ message: problem });

  const { title, amount, categoryId, spentOn, paymentMethod, notes } = req.body;

  // Confirm the category exists, so the user gets a clear message instead of a database error.
  const cat = await db.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
  if (cat.rows.length === 0) {
    return res.status(400).json({ message: 'That category does not exist.' });
  }

  const inserted = await db.query(
    `INSERT INTO expenses (user_id, category_id, title, amount, spent_on, payment_method, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [req.user.id, categoryId, title.trim(), amount, spentOn, paymentMethod, notes?.trim() || null]
  );

  const result = await db.query(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses e JOIN categories c ON c.id = e.category_id WHERE e.id = $1`,
    [inserted.rows[0].id]
  );
  res.status(201).json({ expense: result.rows[0] });
}));

// PUT /api/expenses/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const problem = validateExpense(req.body);
  if (problem) return res.status(400).json({ message: problem });

  const { title, amount, categoryId, spentOn, paymentMethod, notes } = req.body;

  // "AND user_id = $8" is what stops a user editing someone else's expense.
  const updated = await db.query(
    `UPDATE expenses
     SET title = $1, amount = $2, category_id = $3, spent_on = $4, payment_method = $5, notes = $6
     WHERE id = $7 AND user_id = $8
     RETURNING id`,
    [title.trim(), amount, categoryId, spentOn, paymentMethod, notes?.trim() || null, req.params.id, req.user.id]
  );
  if (updated.rows.length === 0) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  const result = await db.query(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses e JOIN categories c ON c.id = e.category_id WHERE e.id = $1`,
    [req.params.id]
  );
  res.json({ expense: result.rows[0] });
}));

// DELETE /api/expenses/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await db.query(
    'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Expense not found.' });
  }
  res.json({ message: 'Expense deleted.' });
}));

module.exports = router;