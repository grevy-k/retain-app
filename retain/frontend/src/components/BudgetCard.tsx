import { Box, Button, Chip, LinearProgress, Paper, Typography } from '@mui/material';
import { formatMoney, formatMonth } from '../utils/format';
import type { BudgetStatus, BudgetSummary } from '../types';

interface BudgetCardProps {
  summary: BudgetSummary;
  onEdit: () => void;
}

// The status of the budget is shown as a colored chip and progress bar. The color and label are determined by the status.
const STATUS_LOOK: Record<Exclude<BudgetStatus, 'no_budget'>, { label: string; color: 'success' | 'warning' | 'error' }> = {
  within: { label: 'Within budget', color: 'success' },
  approaching: { label: 'Approaching limit', color: 'warning' },
  over: { label: 'Over budget', color: 'error' },
};

export default function BudgetCard({ summary, onEdit }: BudgetCardProps) {
  const { budget, spent, remaining, status, percentUsed, month } = summary;

  // No budget yet: invite the user to set one instead of showing empty numbers.
  if (budget === null || status === 'no_budget') {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Monthly budget</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          You haven't set a budget for {formatMonth(month)}. Set one to see how much you can safely spend each day.
        </Typography>
        <Button variant="contained" onClick={onEdit}>Set budget</Button>
      </Paper>
    );
  }

  const look = STATUS_LOOK[status];

  // "Over" covers two cases that deserve different wording: spending exactly the budget
  // (nothing left, but nothing overspent) and spending more than it. Compared in whole cents.
  const reachedExactly = status === 'over' && Math.round(spent * 100) === Math.round(budget * 100);
  const chipLabel = reachedExactly ? 'Budget reached' : look.label;

  const message =
    status === 'over'
      ? reachedExactly
        ? "You've used your entire budget. Nothing is left to spend this month."
        : `You're over budget by ${formatMoney(spent - budget)}.`
      : status === 'approaching'
        ? `Careful: you've used ${percentUsed}% of your budget.`
        : `You're on track: ${percentUsed}% of your budget used.`;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">Monthly budget</Typography>
        <Button size="small" onClick={onEdit}>Edit</Button>
      </Box>

      <Chip label={chipLabel} color={look.color} size="small" sx={{ mb: 2 }} />

      <LinearProgress
        variant="determinate"
        value={Math.min(percentUsed ?? 0, 100)}
        color={look.color}
        sx={{ height: 10, borderRadius: 5, mb: 1.5 }}
      />
      <Typography sx={{ mb: 2 }}>{message}</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Budget</Typography>
          <Typography sx={{ fontWeight: 600 }}>{formatMoney(budget)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Spent</Typography>
          <Typography sx={{ fontWeight: 600 }}>{formatMoney(spent)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Remaining</Typography>
          <Typography sx={{ fontWeight: 600 }} color={remaining !== null && remaining < 0 ? 'error' : 'inherit'}>
            {formatMoney(remaining ?? 0)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}