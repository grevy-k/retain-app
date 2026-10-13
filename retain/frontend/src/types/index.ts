// Shared shapes that match what our backend API sends back.

export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

// What /auth/signin and /auth/signup return.
export interface AuthResponse {
  token: string;
  user: User;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'other';

export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export interface Category {
  id: number;
  name: string;
  is_default: boolean; // true only for "Uncategorized"
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  spentOn: string; // 'YYYY-MM-DD'
  paymentMethod: PaymentMethod;
  notes: string | null;
  categoryId: number;
  categoryName: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: Pagination;
}
// Budget and dashboard 

export type BudgetStatus = 'no_budget' | 'within' | 'approaching' | 'over';

// A lightweight expense row as the dashboard shows it.
export interface ExpenseSummaryItem {
  id: number;
  title: string;
  amount: number;
  spentOn: string; // 'YYYY-MM-DD'
  categoryName: string;
}

export interface CategorySpending {
  category: string;
  total: number;
}

// Matches the response of GET /api/budgets/:month/summary exactly.
export interface BudgetSummary {
  month: string; // 'YYYY-MM'
  budget: number | null; // null = no budget set for this month
  spent: number;
  expenseCount: number;
  remaining: number | null; // negative when over budget
  status: BudgetStatus;
  percentUsed: number | null;
  daysLeft: number;
  safeToSpendPerDay: number | null;
  highestExpense: ExpenseSummaryItem | null;
  spendingByCategory: CategorySpending[];
  recentExpenses: ExpenseSummaryItem[];
}