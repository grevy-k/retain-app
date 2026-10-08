CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(80)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  -- Role is only ever set server-side. Signup always creates a 'user'.
  role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,
  -- The fallback category. Expenses move here when their category is deleted.
  is_default BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id    INTEGER       NOT NULL REFERENCES categories(id),
  title          VARCHAR(120)  NOT NULL,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  spent_on       DATE          NOT NULL,
  payment_method VARCHAR(20)   NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'bank_transfer', 'other')),
  notes          TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- One budget per user per month. month is stored as 'YYYY-MM'.
CREATE TABLE IF NOT EXISTS budgets (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month   CHAR(7)       NOT NULL,
  amount  NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  UNIQUE (user_id, month)
);

-- Indexes for the queries we'll run most a user's expenses by date.
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses (user_id, spent_on DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category  ON expenses (category_id);

-- Seed the default category plus a few starters.
INSERT INTO categories (name, is_default) VALUES ('Uncategorized', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name) VALUES ('Food'), ('Transport'), ('Rent'), ('Airtime & Data'), ('Health'), ('Entertainment')
ON CONFLICT (name) DO NOTHING;