const express = require('express');
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories public, no auth required. The client needs this to show the category list.
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT id, name, is_default FROM categories ORDER BY is_default DESC, name ASC'
  );
  res.json({ categories: result.rows });
}));

// POST /api/categories admin only.
router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  // Case-insensitive duplicate check, so "food" and "Food" can't both exist.
  const dup = await db.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [name]);
  if (dup.rows.length > 0) {
    return res.status(409).json({ message: 'That category already exists.' });
  }

  const result = await db.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING id, name, is_default',
    [name]
  );
  res.status(201).json({ category: result.rows[0] });
}));

// PUT /api/categories/:id  admin only. The default category can't be renamed.
router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  const existing = await db.query('SELECT is_default FROM categories WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ message: 'Category not found.' });
  }
  if (existing.rows[0].is_default) {
    return res.status(400).json({ message: 'The default category cannot be renamed.' });
  }

  // Make sure the new name isn't taken by a different category.
  const dup = await db.query(
    'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2',
    [name, req.params.id]
  );
  if (dup.rows.length > 0) {
    return res.status(409).json({ message: 'That category already exists.' });
  }

  const result = await db.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name, is_default',
    [name, req.params.id]
  );
  res.json({ category: result.rows[0] });
}));

// DELETE /api/categories/:id — admin only.
// Expenses in the deleted category are moved to "Uncategorized", never lost.
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const client = await db.pool.connect();
  try {
    // A transaction means: either every step succeeds or none of them do.
    await client.query('BEGIN');

    const target = await client.query('SELECT is_default FROM categories WHERE id = $1', [req.params.id]);
    if (target.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Category not found.' });
    }
    if (target.rows[0].is_default) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'The default category cannot be deleted.' });
    }

    const fallback = await client.query('SELECT id FROM categories WHERE is_default = TRUE LIMIT 1');
    const fallbackId = fallback.rows[0].id;

    // Step 1: move any expenses in the category being deleted to the default category.
    const moved = await client.query(
      'UPDATE expenses SET category_id = $1 WHERE category_id = $2',
      [fallbackId, req.params.id]
    );

    // Step 2: now it's safe to delete the category.
    await client.query('DELETE FROM categories WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    res.json({ message: 'Category deleted.', expensesMoved: moved.rowCount });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // Always hand the connection back to the pool.
    client.release();
  }
}));

module.exports = router;