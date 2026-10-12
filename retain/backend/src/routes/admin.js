const express = require('express');
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/insights all platform insights in a single response.
router.get('/insights', asyncHandler(async (req, res) => {
  // The admin dashboard needs a lot of data, so we fetch it all in parallel.
  const [
    totals,
    spendingByCategory,
    topCategories,
    bottomCategories,
    recentExpenses,
    recentUsers,
  ] = await Promise.all([
    // Total counts and sums. The subqueries are fast because they use indexes.
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

    // Spending by category, including zero-use categories. The client can use this to draw a pie chart.
    db.query(`
      SELECT c.id, c.name AS category, COALESCE(SUM(e.amount), 0)::float AS total
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
    `),

    // Top 5 categories by number of expenses. The client can use this to draw a bar chart.
    db.query(`
      SELECT c.id, c.name AS category, COUNT(e.id)::int AS "expenseCount"
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY "expenseCount" DESC, c.name ASC
      LIMIT 5
    `),

    // Bottom 5 categories by number of expenses. The client can use this to draw a bar chart.
    db.query(`
      SELECT c.id, c.name AS category, COUNT(e.id)::int AS "expenseCount"
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY "expenseCount" ASC, c.name ASC
      LIMIT 5
    `),

    // The 5 most recent expenses across all users. We select columns explicitly so the password hash can never leak.
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

module.exports = router;