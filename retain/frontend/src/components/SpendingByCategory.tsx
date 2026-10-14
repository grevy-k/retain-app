import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import { formatMoney } from '../utils/format';
import type { CategorySpending } from '../types';

interface SpendingByCategoryProps {
  items: CategorySpending[]; 
  title?: string;
  emptyMessage?: string;
}

export default function SpendingByCategory({
  items,
  title = 'Spending by category',
  emptyMessage = 'No spending recorded this month.',
}: SpendingByCategoryProps) {
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">{emptyMessage}</Typography>
      ) : (
        items.map((item) => {
          const share = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;
          return (
            <Box key={item.category} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.category}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMoney(item.total)} · {Math.round(share)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={share} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          );
        })
      )}
    </Paper>
  );
}