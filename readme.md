# Retain

**Keep more of what you earn.** Retain is a full-stack web app for tracking personal expenses and sticking to a monthly budget. Its signature feature is **"Safe to spend today"**: your remaining budget divided by the days left in the month, so you always know what you can spend today and still finish the month within budget.

- **Live app:** [RETAIN WEB APP_](https://retain-app-i24b.onrender.com)
- **API:** [_MY backend API URL after deployment](https://retain-api-s2ww.onrender.com)(after url add all the APIs /api/health...signin...) to check the back if its runnnig
- **Demo accounts:** sign up for your own, or use

      ADMIN USER: `user@test.com` password `12345678`
      REGULAR USER: `demo@example.com` passowrd `password`
> The API runs on a free hosting tier that sleeps when idle, so the very first request after a quiet period can take around 30 to 60 seconds.

## Features

### For users
- Sign up, sign in and sign out, with a saved session that survives a refresh
- Record expenses with a title, amount, category, date, payment method and optional notes
- Create, view, edit and delete your own expenses, including a dedicated details page for each one
- Search by title or notes, filter by category, payment method, date range and amount range, and sort by date or amount
- Server-side pagination for large sets of expenses
- Set a monthly budget and see spent, remaining and whether you are **within**, **approaching** (80% or more) or **over** budget
- A dashboard with total spent, remaining budget, highest expense, spending by category, recent expenses and "Safe to spend today"
- Browse any previous month
- Settings: change your name or password, choose Light, Dark or System theme, export your expenses as CSV, and delete your account
- Responsive layout (tables become cards on phones) and a dark mode

### For admins
- Admin-only area protected on both the frontend and the API
- Create, rename and delete expense categories. Deleting a category moves its expenses to the default **Uncategorized** category inside a database transaction, so no spending history is lost
- Platform insights: total users, total expenses, total value, expenses this month, spending per category, top 5 and bottom 5 most-used categories, recent expenses and recent users
- "View more" lists with pagination for all expenses and all users

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Material-UI, React Router |
| State | **React Context** for authentication, **Redux Toolkit** for expense filtering, searching, sorting and paging |
| Backend | Node.js, Express |
| Database | PostgreSQL (raw SQL through `pg`) |
| Security | bcrypt password hashing, JWT, helmet, rate limiting |
| Hosting | Render (API and static site) and Neon (PostgreSQL) |

## How state is organised

The brief asks for a strict split, and the code follows it:

- **Authentication lives only in React Context.** `AuthProvider` holds the user and exposes `signIn`, `signUp`, `signOut`, `updateUser` and `isAdmin`. `ProtectedRoute`, `AdminRoute` and `GuestRoute` all read that context.
- **Filtering, searching and sorting live only in Redux.** `filtersSlice` stores the search text, category, payment method, date range, amount range, sort order and current page. `toQueryString()` turns that state into the API query. A small debounce hook only delays the network request, while the search text itself stays in Redux.
- Server data (the expense list and dashboard summary) is loaded by custom hooks, not stored in Redux.
- The theme preference (Light, Dark or System) has its own small context. It is a display preference and is unrelated to auth or filters.

## Project structure

```
retain/
├── backend/
│   ├── db/
│   │   ├── schema.sql            # tables, indexes and seed categories
│   │   └── sample_data.sql       # optional development data
│   └── src/
│       ├── server.js             # app setup, security middleware, routing
│       ├── db.js                 # PostgreSQL connection pool
│       ├── middleware/auth.js    # requireAuth and requireAdmin
│       ├── routes/               # auth, categories, expenses, budgets, admin, account
│       └── utils/asyncHandler.js
└── frontend/
    └── src/
        ├── api/                  # fetch wrapper and token storage
        ├── context/              # AuthProvider and ThemeModeProvider
        ├── store/                # Redux store and filtersSlice
        ├── hooks/                # useAuth, useApi, useExpenses, useBudgetSummary, ...
        ├── components/           # reusable UI and route guards
        ├── pages/                # one file per screen
        ├── types/                # shared TypeScript types
        ├── utils/                # money and date formatting
        └── theme.ts
```

## API reference

All routes are under `/api`. "User" means any signed-in user. "Admin" means the admin role is required.

| Method and path | Access | Purpose |
|---|---|---|
| `POST /auth/signup` | Public | Create an account (always created as a normal user) |
| `POST /auth/signin` | Public | Sign in and receive a token |
| `GET /auth/me` | User | The current user, used to restore a session |
| `GET /categories` | User | List categories |
| `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` | Admin | Manage categories (deleting moves expenses to Uncategorized) |
| `GET /expenses` | User | Your expenses with filters and pagination (see below) |
| `GET /expenses/:id` | User | One of your expenses |
| `POST /expenses`, `PUT /expenses/:id`, `DELETE /expenses/:id` | User | Create, update and delete your expenses |
| `PUT /budgets/:month` | User | Create or update the budget for a month (`YYYY-MM`) |
| `GET /budgets/:month/summary` | User | Everything the dashboard shows for that month |
| `PUT /account/profile` | User | Change your name |
| `PUT /account/password` | User | Change your password (needs the current one) |
| `GET /account/export` | User | Download your expenses as CSV |
| `DELETE /account` | User | Delete your account and data (needs your password) |
| `GET /admin/insights` | Admin | Platform insights |
| `GET /admin/expenses`, `GET /admin/users` | Admin | Paginated lists of every expense and every user |
| `GET /health` | Public | Server and database check |

`GET /expenses` accepts: `search`, `categoryId`, `paymentMethod`, `from`, `to`, `minAmount`, `maxAmount`, `sort` (`date_desc`, `date_asc`, `amount_desc`, `amount_asc`), `page` and `limit` (maximum 50).

## Database

Four tables: `users` (with a `role` of `user` or `admin`), `categories` (one row flagged `is_default` for Uncategorized), `expenses` (belongs to a user and a category) and `budgets` (one row per user per month). Deleting a user cascades to their expenses and budgets. The full definition is in `backend/db/schema.sql`.

## Running it locally

**Prerequisites:** Node.js 20 or newer and PostgreSQL 14 or newer.

```bash
# 1. Database
createdb retain
psql -d retain -f backend/db/schema.sql

# 2. Backend (http://localhost:5000)
cd backend
cp .env.example .env        # then edit the values
npm install
npm run dev

# 3. Frontend (http://localhost:5173), in a second terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

If your PostgreSQL uses a `postgres` role, create the database with `psql -U postgres -c "CREATE DATABASE retain;"` and add `-U postgres` to the `psql` commands.

**Making an admin.** Sign up in the app, then promote that account (the role can never be set through the API):

```bash
psql -d retain -c "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

Sign out and back in to pick up the new role. For demo data, optionally run `psql -d retain -f backend/db/sample_data.sql` after editing the email inside it.
## Demo data

To fill a database with realistic demo data (a demo user, three months of expenses, budgets, and extra accounts so the admin pages doesn't look empty):

```bash
cd backend
DEMO_PASSWORD="choose-a-password" npm run seed:demo
```

The script only touches its own demo accounts (emails ending in `@example.com`), can be re-run at any time to refresh the dates, and `node scripts/seed-demo.js --remove` deletes the demo data again.

### Environment variables

| Backend (`backend/.env`) | Meaning |
|---|---|
| `PORT` | Port to listen on (default 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string used to sign tokens (32+ characters in production) |
| `CLIENT_URL` | Exact frontend origin allowed by CORS, with no trailing slash |
| `NODE_ENV` | Set to `production` on the host (enables SSL for the database) |

| Frontend (`frontend/.env`) | Meaning |
|---|---|
| `VITE_API_URL` | Base URL of the API, for example `http://localhost:5000/api` |
| `VITE_CURRENCY` | Three-letter currency code used for display, for example `USD` or `RWF` |

## Deployment

The database runs on **Neon**, the API on a **Render** web service (root directory `backend`), and the frontend on a **Render** static site (root directory `frontend`) with a rewrite rule from `/*` to `/index.html` so deep links work. _Add the final URLs above once deployed._

## Security and design decisions

- Passwords are hashed with bcrypt. Tokens are JWTs that expire after 7 days.
- **Users can only reach their own data.** The user id always comes from the verified token, never from the request, and every expense and budget query filters on it. Another user's expense returns 404, not 403, so its existence isn't revealed.
- **The role is never accepted from the client.** Sign-up always creates a normal user.
- All SQL is parameterised. Sorting uses a whitelist, so user input never reaches `ORDER BY`.
- Deleting a category runs inside a transaction: expenses are moved to Uncategorized, then the category is deleted.
- Dates are stored and sent as plain `YYYY-MM-DD` text, which avoids the off-by-one-day bugs that timezone conversion causes.
- The CSV export neutralises cells that begin with `=`, `+`, `-` or `@` to prevent spreadsheet formula injection.
- helmet sets security headers, and sign-in and sign-up are rate limited to 30 attempts per 15 minutes per visitor.
- A wrong current password returns 400 rather than 401, so the frontend does not mistake it for an expired session.

## Known limitations and future work

- **Existing sessions stay valid after a password change** until their token expires (7 days). Tokens are stateless. A token version stored on the user would let a password change sign out other devices.
- **No email features.** There is no email verification, password reset or email change. These need a mail provider and a verified sending domain.
- **Free hosting sleeps when idle**, so the first request after a quiet period is slow.
- Currency is a deployment-wide setting rather than a per-user preference.
