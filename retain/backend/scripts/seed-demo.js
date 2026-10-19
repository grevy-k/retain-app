// Fills Retain with realistic demo data, so the app doesn't start from an empty screen.
//
// Add or refresh the demo data:
//   DEMO_PASSWORD="password123" node scripts/seed-demo.js
// Remove it again:
//   node scripts/seed-demo.js --remove
//
// It only ever touches the demo accounts listed in this file, so it is safe to re-run before every demo:
// each run rebuilds their data, with dates counted back from today so the current month always looks fresh.
//
// Optional settings (environment variables):
//   DEMO_EMAIL    sign-in email of the demo user. Must end in @example.com. Default: demo@example.com
//   AMOUNT_SCALE  multiplies every amount. The built-in amounts suit currencies like RWF;
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../src/db');

const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@example.com').trim().toLowerCase();
const SCALE = Number(process.env.AMOUNT_SCALE || 1);

//randomly generated names and emails, with a "joined" date in the past.
const OTHER_USERS = [
  { name: 'Amina Yusuf', email: 'amina.yusuf@example.com', joinedDaysAgo: 40 },
  { name: 'Daniel Okoro', email: 'daniel.okoro@example.com', joinedDaysAgo: 31 },
  { name: 'Grace Mwangi', email: 'grace.mwangi@example.com', joinedDaysAgo: 22 },
  { name: 'Samuel Tesfaye', email: 'samuel.tesfaye@example.com', joinedDaysAgo: 14 },
  { name: 'Fatima Ahmed', email: 'fatima.ahmed@example.com', joinedDaysAgo: 8 },
  { name: 'Peter Banda', email: 'peter.banda@example.com', joinedDaysAgo: 3 },
  { name: 'Nadia Hassan', email: 'nadia.hassan@example.com', joinedDaysAgo: 1 },
];

// The demo user's typical month.
// Each row: day of month, title, category, usual amount, payment method, notes.
const MONTH_TEMPLATE = [
  [1, 'Monthly rent', 'Rent', 150000, 'bank_transfer', 'Paid to landlord'],
  [2, 'Data bundle', 'Airtime & Data', 10000, 'mobile_money', null],
  [3, 'Weekly groceries', 'Food', 24000, 'card', 'Supermarket'],
  [4, 'Lunch with colleagues', 'Food', 6500, 'cash', null],
  [5, 'Streaming subscription', 'Entertainment', 7000, 'card', null],
  [6, 'Taxi to campus', 'Transport', 3000, 'mobile_money', null],
  [7, 'Pharmacy', 'Health', 8500, 'cash', 'Vitamins'],
  [8, 'Textbook', 'Education', 22000, 'card', 'Semester reading'],
  [9, 'Lunch', 'Food', 4000, 'cash', null],
  [10, 'Weekly groceries', 'Food', 21500, 'card', 'Supermarket'],
  [11, 'Moto ride', 'Transport', 1500, 'cash', null],
  [12, 'Coffee and snack', 'Food', 3200, 'mobile_money', null],
  [14, 'Airtime top-up', 'Airtime & Data', 3000, 'mobile_money', null],
  [15, 'Bus pass', 'Transport', 12000, 'mobile_money', 'Monthly pass'],
  [16, 'Dinner out', 'Food', 14500, 'card', 'Birthday dinner'],
  [17, 'Weekly groceries', 'Food', 26000, 'card', 'Supermarket'],
  [18, 'Cinema tickets', 'Entertainment', 9000, 'cash', null],
  [19, 'Lunch', 'Food', 4500, 'cash', null],
  [20, 'Taxi home', 'Transport', 4500, 'mobile_money', 'Late evening'],
  [21, 'Haircut', 'Uncategorized', 5000, 'cash', null],
  [22, 'Clinic visit', 'Health', 15000, 'cash', null],
  [24, 'Weekly groceries', 'Food', 23000, 'card', 'Supermarket'],
  [25, 'Online course', 'Education', 30000, 'card', null],
  [26, 'Lunch', 'Food', 4200, 'cash', null],
  [27, 'Moto ride', 'Transport', 2000, 'cash', null],
  [28, 'Gift for a friend', 'Uncategorized', 18000, 'cash', null],
];

// Prices that shouldn't wobble from month to month (rent, subscriptions, passes).
const FIXED_TITLES = new Set(['Monthly rent', 'Streaming subscription', 'Bus pass', 'Online course']);

// A few everyday expenses that other demo users might have, with a typical amount and payment method.
const EVERYDAY_POOL = [
  ['Groceries', 'Food', 18000, 'card'],
  ['Lunch', 'Food', 4500, 'cash'],
  ['Lunch', 'Food', 3800, 'mobile_money'],
  ['Coffee', 'Food', 2500, 'mobile_money'],
  ['Taxi', 'Transport', 3500, 'mobile_money'],
  ['Moto ride', 'Transport', 1500, 'cash'],
  ['Fuel', 'Transport', 20000, 'card'],
  ['Airtime top-up', 'Airtime & Data', 2000, 'mobile_money'],
  ['Pharmacy', 'Health', 7000, 'cash'],
  ['Movie night', 'Entertainment', 8000, 'card'],
  ['Notebook and pens', 'Education', 4000, 'cash'],
  ['Phone repair', 'Uncategorized', 25000, 'cash'],
];

// Returns the number of days left in the month, counting today as a full day.
function makeRandom(seed) {
  let state = seed;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (year, monthIndex, day) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

// 'YYYY-MM-DD' for the day that was `daysAgo` days before `today`.
function dateDaysAgo(today, daysAgo) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
  return isoDate(d.getFullYear(), d.getMonth(), d.getDate());
}

// Applies the currency scale and a little natural variation, rounded to a tidy amount.
function priceOf(base, title, random) {
  const factor = FIXED_TITLES.has(title) ? 1 : 0.88 + random() * 0.24; // roughly +/- 12%
  const step = Math.max(0.01, 100 * SCALE);
  const rounded = Math.max(step, Math.round((base * SCALE * factor) / step) * step);
  return Number(rounded.toFixed(2));
}

// When the expense was "recorded": the morning of its date, but never in the future.
function recordedAt(isoDateString, now) {
  const stamp = new Date(`${isoDateString}T08:00:00Z`);
  return (stamp > now ? now : stamp).toISOString();
}

// The demo user's budget: about 8% above a normal month's spending, rounded to a tidy figure.
function monthlyBudgetAmount() {
  const monthTotal = MONTH_TEMPLATE.reduce((sum, row) => sum + row[3], 0) * SCALE;
  const step = Math.max(0.01, 5000 * SCALE);
  return Number((Math.ceil((monthTotal * 1.08) / step) * step).toFixed(2));
}

// Creates the user if the email is new. Existing users keep their id (and role).
async function upsertUser(client, { name, email, passwordHash, joinedDaysAgo, refreshPassword }) {
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, created_at)
     VALUES ($1, $2, $3, NOW() - ($4::int * INTERVAL '1 day'))
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           password_hash = CASE WHEN $5::boolean THEN EXCLUDED.password_hash ELSE users.password_hash END
     RETURNING id`,
    [name, email, passwordHash, joinedDaysAgo, refreshPassword]
  );
  return result.rows[0].id;
}

// Inserts many expenses in one query by passing each column as an array.
async function insertExpenses(client, rows) {
  if (rows.length === 0) return;
  await client.query(
    `INSERT INTO expenses (user_id, category_id, title, amount, spent_on, payment_method, notes, created_at)
     SELECT * FROM unnest($1::int[], $2::int[], $3::text[], $4::numeric[], $5::date[], $6::text[], $7::text[], $8::timestamptz[])`,
    [
      rows.map((r) => r.userId),
      rows.map((r) => r.categoryId),
      rows.map((r) => r.title),
      rows.map((r) => r.amount),
      rows.map((r) => r.date),
      rows.map((r) => r.method),
      rows.map((r) => r.notes),
      rows.map((r) => r.createdAt),
    ]
  );
}

function describeDatabase() {
  try {
    return new URL(process.env.DATABASE_URL).host;
  } catch {
    return 'unknown';
  }
}

async function seed(client) {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('Set DEMO_PASSWORD (at least 8 characters). It becomes the demo user\'s sign-in password.');
  }

  const categories = (await client.query('SELECT id, name, is_default FROM categories')).rows;
  const idByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const fallbackId = categories.find((c) => c.is_default)?.id;
  if (!fallbackId) throw new Error('No default category found. Has schema.sql been loaded into this database?');
  // A category that doesn't exist in this database falls back to Uncategorized instead of failing.
  const categoryId = (name) => idByName.get(name.toLowerCase()) ?? fallbackId;

  // --- Accounts ---
  const demoUserId = await upsertUser(client, {
    name: 'Demo User',
    email: DEMO_EMAIL,
    passwordHash: await bcrypt.hash(password, 10),
    joinedDaysAgo: 90,
    refreshPassword: true,
  });

  const others = [];
  for (const person of OTHER_USERS) {
    const unknownPassword = crypto.randomBytes(24).toString('hex'); // never revealed to anyone
    const id = await upsertUser(client, {
      ...person,
      passwordHash: await bcrypt.hash(unknownPassword, 10),
      refreshPassword: false,
    });
    others.push({ ...person, id });
  }

  // Start clean so running the script again never doubles anything.
  const allIds = [demoUserId, ...others.map((o) => o.id)];
  await client.query('DELETE FROM expenses WHERE user_id = ANY($1::int[])', [allIds]);
  await client.query('DELETE FROM budgets WHERE user_id = ANY($1::int[])', [allIds]);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const random = makeRandom(20261018);

  // --- The demo user: three months of a normal life ---
  const demoRows = [];
  for (let back = 0; back < 3; back += 1) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() - back, 1);
    const lastDay = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();

    for (const [day, title, categoryName, base, method, notes] of MONTH_TEMPLATE) {
      const dayOfMonth = Math.min(day, lastDay);
      // Don't invent expenses dated in the future during the current month.
      if (back === 0 && dayOfMonth > today.getDate()) continue;

      const date = isoDate(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), dayOfMonth);
      demoRows.push({
        userId: demoUserId,
        categoryId: categoryId(categoryName),
        title,
        amount: priceOf(base, title, random),
        date,
        method,
        notes,
        createdAt: recordedAt(date, now),
      });
    }
  }

  // --- The other accounts: a few recent expenses each, after the day they "joined" ---
  const otherRows = [];
  for (const person of others) {
    const count = 8 + Math.floor(random() * 7);
    for (let i = 0; i < count; i += 1) {
      const [title, categoryName, base, method] = EVERYDAY_POOL[Math.floor(random() * EVERYDAY_POOL.length)];
      const date = dateDaysAgo(today, Math.floor(random() * person.joinedDaysAgo));
      otherRows.push({
        userId: person.id,
        categoryId: categoryId(categoryName),
        title,
        amount: priceOf(base, title, random),
        date,
        method,
        notes: null,
        createdAt: recordedAt(date, now),
      });
    }
  }

  await insertExpenses(client, demoRows);
  await insertExpenses(client, otherRows);

  // --- Budgets for the current month and the two before it ---
  const budget = monthlyBudgetAmount();
  for (let back = 0; back < 3; back += 1) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() - back, 1);
    const month = `${firstOfMonth.getFullYear()}-${pad(firstOfMonth.getMonth() + 1)}`;
    await client.query(
      `INSERT INTO budgets (user_id, month, amount) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, month) DO UPDATE SET amount = EXCLUDED.amount`,
      [demoUserId, month, budget]
    );
  }

  console.log(`Demo user ready: ${DEMO_EMAIL}`);
  console.log(`Added ${demoRows.length} expenses for the demo user and ${otherRows.length} across ${others.length} other demo accounts.`);
  console.log(`Monthly budget set to ${budget.toLocaleString()} for the last 3 months.`);
  console.log(`Done. Sign in as ${DEMO_EMAIL} with the password you set.`);
}

async function remove(client) {
  const emails = [DEMO_EMAIL, ...OTHER_USERS.map((u) => u.email)];
  // Deleting a user also deletes their expenses and budgets (ON DELETE CASCADE).
  const result = await client.query('DELETE FROM users WHERE email = ANY($1::text[])', [emails]);
  console.log(`Removed ${result.rowCount} demo accounts and everything they owned.`);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.');
  // This guard means the script can never touch a real person's account.
  if (!DEMO_EMAIL.endsWith('@example.com')) throw new Error('DEMO_EMAIL must end in @example.com.');
  if (!Number.isFinite(SCALE) || SCALE <= 0) throw new Error('AMOUNT_SCALE must be a number greater than 0.');

  console.log(`Database host: ${describeDatabase()}`);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN'); // all or nothing: a failure halfway leaves the database untouched

    const existing = await client.query('SELECT role FROM users WHERE email = $1', [DEMO_EMAIL]);
    if (existing.rows[0]?.role === 'admin') {
      throw new Error(`${DEMO_EMAIL} is an admin account, so it can't be used as the demo user.`);
    }

    if (process.argv.includes('--remove')) await remove(client);
    else await seed(client);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await db.pool.end();
  }
}

main().catch((err) => {
  console.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});