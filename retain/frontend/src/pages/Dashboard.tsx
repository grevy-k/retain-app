import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Snackbar, Typography } from '@mui/material';
import BudgetCard from '../components/BudgetCard';
import BudgetDialog from '../components/BudgetDialog';
import MonthPicker from '../components/MonthPicker';
import RecentExpenses from '../components/RecentExpenses';
import SpendingByCategory from '../components/SpendingByCategory';
import StatCard from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { useBudgetSummary } from '../hooks/useBudgetSummary';
import { currentMonthISO, daysInMonth, formatDate, formatMonth, formatMoney } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonthISO());
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { summary, isLoading, error, reload } = useBudgetSummary(month);
  const firstName = user?.name.split(' ')[0];

  function handleBudgetSaved(message: string) {
    setBudgetOpen(false);
    setToast(message);
    reload(); // refresh every number that depends on the budget
  }

  // The fourth card changes with context. For the current month it's Retain's signature
  // "safe to spend today"; for past or future months a daily allowance makes no sense,
  // so we show the average daily spend instead.
  function renderFourthCard() {
    if (!summary) return null;
    const isCurrentMonth = summary.month === currentMonthISO();

    if (!isCurrentMonth) {
      return (
        <StatCard
          label="Average per day"
          value={formatMoney(summary.spent / daysInMonth(summary.month))}
          caption={`across ${formatMonth(summary.month)}`}
        />
      );
    }
    if (summary.budget === null) {
      return <StatCard tone="highlight" label="Safe to spend today" value="—" caption="Set a budget to see this" />;
    }
    if (summary.status === 'over' || (summary.remaining ?? 0) <= 0) {
      return (
        <StatCard
          tone="highlight"
          label="Safe to spend today"
          value={formatMoney(0)}
          caption="Your budget is used up for this month"
        />
      );
    }
    return (
      <StatCard
        tone="highlight"
        label="Safe to spend today"
        value={formatMoney(summary.safeToSpendPerDay ?? 0)}
        caption={`${summary.daysLeft} ${summary.daysLeft === 1 ? 'day' : 'days'} left in the month`}
      />
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4">Hello, {firstName}</Typography>
          <Typography color="text.secondary">Here's where your money went.</Typography>
        </Box>
        <MonthPicker month={month} onChange={setMonth} />
      </Box>

      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* First load only: nothing to show yet */}
      {!summary && isLoading && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {summary && (
        // Dim the old numbers while a new month loads, rather than flashing a blank page.
        <Box sx={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              mb: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
          >
            <StatCard
              label={`Spent in ${formatMonth(summary.month)}`}
              value={formatMoney(summary.spent)}
              caption={`${summary.expenseCount} ${summary.expenseCount === 1 ? 'expense' : 'expenses'}`}
            />
            <StatCard
              label="Remaining budget"
              value={summary.remaining === null ? '—' : formatMoney(summary.remaining)}
              caption={summary.budget === null ? 'No budget set yet' : `of ${formatMoney(summary.budget)}`}
              tone={summary.remaining !== null && summary.remaining < 0 ? 'danger' : 'default'}
            />
            <StatCard
              label="Highest expense"
              value={summary.highestExpense ? formatMoney(summary.highestExpense.amount) : '—'}
              caption={
                summary.highestExpense
                  ? `${summary.highestExpense.title} · ${formatDate(summary.highestExpense.spentOn)}`
                  : 'Nothing recorded this month'
              }
            />
            {renderFourthCard()}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              alignItems: 'start',
            }}
          >
            <BudgetCard summary={summary} onEdit={() => setBudgetOpen(true)} />
            <SpendingByCategory items={summary.spendingByCategory} />
            <Box sx={{ gridColumn: { md: 'span 2' } }}>
              <RecentExpenses items={summary.recentExpenses} />
            </Box>
          </Box>
        </Box>
      )}

      {budgetOpen && summary && (
        <BudgetDialog
          month={summary.month}
          currentBudget={summary.budget}
          onClose={() => setBudgetOpen(false)}
          onSaved={handleBudgetSaved}
        />
      )}

      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} message={toast ?? ''} />
    </>
  );
}