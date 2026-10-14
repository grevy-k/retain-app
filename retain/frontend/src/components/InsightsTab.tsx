import { useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Typography } from '@mui/material';
import AllExpensesDialog from './AllExpensesDialog';
import AllUsersDialog from './AllUsersDialog';
import CategoryUsageList from './CategoryUsageList';
import SpendingByCategory from './SpendingByCategory';
import StatCard from './StatCard';
import { useApi } from '../hooks/useApi';
import { formatDate, formatMoney, formatTimestamp } from '../utils/format';
import type { AdminInsights } from '../types';

export default function InsightsTab() {
  // Fetched when the tab opens, so switching back here always shows fresh numbers.
  const { data, isLoading, error, reload } = useApi<AdminInsights>('/admin/insights');

  // The "View more" buttons open a dialog with a paginated list of every expense or user on the platform.
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { totals } = data;

  // Only offer "View more" when there really are more items than the 5 shown.
  const hasMoreExpenses = totals.expenses > data.recentExpenses.length;
  const hasMoreUsers = totals.users > data.recentUsers.length;

  return (
    <Box sx={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      {/* Headline numbers */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        <StatCard label="Registered users" value={totals.users.toLocaleString()} />
        <StatCard label="Expenses recorded" value={totals.expenses.toLocaleString()} />
        <StatCard label="Total value recorded" value={formatMoney(totals.totalValue)} />
        <StatCard label="Recorded this month" value={totals.expensesThisMonth.toLocaleString()} caption="expenses dated this month" />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, alignItems: 'start' }}>
        <Box sx={{ gridColumn: { md: 'span 2' } }}>
          <SpendingByCategory
            items={data.spendingByCategory}
            title="Total spending per category"
            emptyMessage="No categories yet."
          />
        </Box>

        <CategoryUsageList title="Top 5 most-used" subtitle="Categories with the most expenses" items={data.topCategories} />
        <CategoryUsageList title="Bottom 5 least-used" subtitle="Categories with the fewest expenses" items={data.bottomCategories} />

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Recently added expenses</Typography>
          {data.recentExpenses.length === 0 ? (
            <Typography color="text.secondary">No expenses recorded yet.</Typography>
          ) : (
            data.recentExpenses.map((expense, index) => (
              <Box key={expense.id}>
                {index > 0 && <Divider />}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.25 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>{expense.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {expense.userName} · {expense.categoryName} · {formatDate(expense.spentOn)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Added {formatTimestamp(expense.createdAt)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatMoney(expense.amount)}</Typography>
                </Box>
              </Box>
            ))
          )}

          {hasMoreExpenses && (
            <Button sx={{ mt: 1 }} onClick={() => setExpensesOpen(true)}>
              View more
            </Button>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Recently registered users</Typography>
          {data.recentUsers.map((user, index) => (
            <Box key={user.id}>
              {index > 0 && <Divider />}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 1.25 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Joined {formatTimestamp(user.createdAt)}
                  </Typography>
                </Box>
                {user.role === 'admin' && <Chip size="small" color="primary" label="Admin" />}
              </Box>
            </Box>
          ))}

          {hasMoreUsers && (
            <Button sx={{ mt: 1 }} onClick={() => setUsersOpen(true)}>
              View more
            </Button>
          )}
        </Paper>
      </Box>

      {/* The "View more" dialogs */}
      {expensesOpen && <AllExpensesDialog onClose={() => setExpensesOpen(false)} />}
      {usersOpen && <AllUsersDialog onClose={() => setUsersOpen(false)} />}
    </Box>
  );
}