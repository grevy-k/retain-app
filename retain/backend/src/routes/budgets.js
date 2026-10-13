const express = require('express');
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Months are stored and passed as 'YYYY-MM'.
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// "approaching" starts at 80% of the budget.
function budgetStatus(spent, budget) {
  if (budget === null) return 'no_budget';
  if (spent > budget) return 'over';
  if (spent >= budget * 0.8) return 'approaching';
  return 'within';
}

// How many days are left in the month,
function daysLeftIn(month) {
  const [year, mon] = month.split('-').map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const now = new Date();

  // For past or future months theres no meaningful "today", so use the full month.
  if (month !== currentMonth()) return lastDay;
  return lastDay - now.getDate() + 1;
}

// PUT /api/budgets/:month 
router.put('/:month', asyncHandler(async (req, res) => {
  const { month } = req.params;
  const amount = Number(req.body.amount);

  if (!MONTH_PATTERN.test(month)) {
    return res.status(400).json({ message: 'Month must look like 2026-10.' });
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({ message: 'Budget must be a number, 0 or more.' });
  }

  // "Upsert": insert, or update if this user already has a budget for that month.
  const result = await db.query(
    `INSERT INTO budgets (user_id, month, amount) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, month) DO UPDATE SET amount = EXCLUDED.amount
     RETURNING month, amount::float AS amount`,
    [req.user.id, month, amount]
  );
  res.json({ budget: result.rows[0] });
}));

// GET /api/budgets/:month/summary everything the dashboard shows.
router.get('/:month/summary', asyncHandler(async (req, res) => {
  const { month } = req.params;
  if (!MONTH_PATTERN.test(month)) {
    return res.status(400).json({ message: 'Month must look like 2026-10.' });
  }

  // Month boundaries as dates
  const start = `${month}-01`;
  const rangeSql = `e.user_id = $1 AND e.spent_on >= $2::date AND e.spent_on < ($2::date + INTERVAL '1 month')`;

  const budgetRow = await db.query(
    'SELECT amount::float AS amount FROM budgets WHERE user_id = $1 AND month = $2',
    [req.user.id, month]
  );
  const budget = budgetRow.rows.length ? budgetRow.rows[0].amount : null;

  const totals = await db.query(
    `SELECT COALESCE(SUM(e.amount), 0)::float AS spent, COUNT(*)::int AS count
     FROM expenses e WHERE ${rangeSql}`,
    [req.user.id, start]
  );
  const { spent, count } = totals.rows[0];

  const highest = await db.query(
    `SELECT e.id, e.title, e.amount::float AS amount, e.spent_on AS "spentOn", c.name AS "categoryName"
     FROM expenses e JOIN categories c ON c.id = e.category_id
     WHERE ${rangeSql} ORDER BY e.amount DESC LIMIT 1`,
    [req.user.id, start]
  );

  const byCategory = await db.query(
    `SELECT c.name AS category, SUM(e.amount)::float AS total
     FROM expenses e JOIN categories c ON c.id = e.category_id
     WHERE ${rangeSql} GROUP BY c.name ORDER BY total DESC`,
    [req.user.id, start]
  );

  const recent = await db.query(
    `SELECT e.id, e.title, e.amount::float AS amount, e.spent_on AS "spentOn", c.name AS "categoryName"
     FROM expenses e JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = $1 ORDER BY e.created_at DESC LIMIT 5`,
    [req.user.id]
  );

  const remaining = budget === null ? null : budget - spent;
  const daysLeft = daysLeftIn(month);

  // Retain's signature number: what you can spend per day and still stay within budget.
  const safeToSpendPerDay =
    remaining === null ? null : Math.max(remaining, 0) / daysLeft;

  res.json({
    month,
    budget,
    spent,
    expenseCount: count,
    remaining,
    status: budgetStatus(spent, budget),
    percentUsed: budget ? Math.round((spent / budget) * 100) : null,
    daysLeft,
    safeToSpendPerDay: safeToSpendPerDay === null ? null : Math.round(safeToSpendPerDay * 100) / 100,
    highestExpense: highest.rows[0] || null,
    spendingByCategory: byCategory.rows,
    recentExpenses: recent.rows,
  });
}));

module.exports = router;