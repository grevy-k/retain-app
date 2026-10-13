-- Adds 25 sample expenses for grevy@test.com, spread across categories, dates and payment methods.
-- Change the email below if you use a different account.
INSERT INTO expenses (user_id, category_id, title, amount, spent_on, payment_method, notes)
SELECT
  (SELECT id FROM users WHERE email = 'grevy@test.com'),
  (SELECT id FROM categories ORDER BY id OFFSET (g % 7) LIMIT 1),
  'Sample expense ' || g,
  g * 1250,
  CURRENT_DATE - (g % 40),
  (ARRAY['cash', 'card', 'mobile_money', 'bank_transfer', 'other'])[1 + g % 5],
  CASE WHEN g % 3 = 0 THEN 'Seeded note ' || g END
FROM generate_series(1, 25) AS g;