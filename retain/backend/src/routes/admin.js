const express = require('express');
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// One guard for the whole file: every route below is admin-only.
// Order matters: requireAuth sets req.user, then requireAdmin checks its role.
router.use(requireAuth, requireAdmin);

// GET /api/admin/insights: all platform insights in a single response.
router.get('/insights', asyncHandler(async (req, res) => {
  // These queries don't depend on each other, so run them at the same time.
  const [
    totals,
    spendingByCategory,
    topCategories,
    bottomCategories,
    recentExpenses,
    recentUsers,
  ] = await Promise.all([
    // Headline numbers. COALESCE turns "no expenses yet" into 0 instead of null.
    db.query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int                              AS users,
        (SELECT COUNT(*) FROM expenses)::int                           AS expenses,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses)::float         AS "totalValue",
        (SELECT COUNT(*) FROM expenses
          WHERE spent_on >= date_trunc('month', CURRENT_DATE)
            AND spent_on <  date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::int
                                                                       AS "expensesThisMonth"
    `),

    // Total spending per category. LEFT JOIN keeps categories that have no expenses (total 0).
    db.query(`
      SELECT c.id, c.name AS category, COALESCE(SUM(e.amount), 0)::float AS total
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
    `),

    // Most-used = highest number of expenses. Name is the tiebreaker so results are stable.
    db.query(`
      SELECT c.id, c.name AS category, COUNT(e.id)::int AS "expenseCount"
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY "expenseCount" DESC, c.name ASC
      LIMIT 5
    `),

    // Least-used = lowest number of expenses (zero-use categories come first).
    db.query(`
      SELECT c.id, c.name AS category, COUNT(e.id)::int AS "expenseCount"
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY "expenseCount" ASC, c.name ASC
      LIMIT 5
    `),

    // Newest expenses by when they were recorded (not the date they were spent on).
    db.query(`
      SELECT e.id, e.title, e.amount::float AS amount, e.spent_on AS "spentOn",
             e.created_at AS "createdAt", c.name AS "categoryName", u.name AS "userName"
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at DESC
      LIMIT 5
    `),

    // Newest sign-ups. We select columns explicitly so the password hash can never leak.
    db.query(`
      SELECT id, name, email, role, created_at AS "createdAt"
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `),
  ]);

  res.json({
    totals: totals.rows[0],
    spendingByCategory: spendingByCategory.rows,
    topCategories: topCategories.rows,
    bottomCategories: bottomCategories.rows,
    recentExpenses: recentExpenses.rows,
    recentUsers: recentUsers.rows,
  });
}));

// GET /api/admin/expenses?page=1&limit=10: every expense on the platform, newest first.
router.get('/expenses', asyncHandler(async (req, res) => {
  // Clamp the values so nobody can ask for page -5 or 100000 rows at once.
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const [countResult, listResult] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS total FROM expenses'),
    db.query(
      `SELECT e.id, e.title, e.amount::float AS amount, e.spent_on AS "spentOn",
              e.created_at AS "createdAt", c.name AS "categoryName", u.name AS "userName"
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       JOIN users u ON u.id = e.user_id
       ORDER BY e.created_at DESC, e.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
  ]);

  const total = countResult.rows[0].total;

  res.json({
    expenses: listResult.rows,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}));

module.exports = router;
// GET /api/admin/users?page=1&limit=10: every registered user, newest first.
// This is what the "View more" button on the recent-users card opens.
router.get('/users', asyncHandler(async (req, res) => {
  // Clamp the values so nobody can ask for page -5 or 100000 rows at once.
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const [countResult, listResult] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS total FROM users'),
    // Columns are listed explicitly so password_hash can never leak into the response.
    db.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at AS "createdAt",
              (SELECT COUNT(*) FROM expenses e WHERE e.user_id = u.id)::int AS "expenseCount"
       FROM users u
       ORDER BY u.created_at DESC, u.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
  ]);

  const total = countResult.rows[0].total;

  res.json({
    users: listResult.rows,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}));