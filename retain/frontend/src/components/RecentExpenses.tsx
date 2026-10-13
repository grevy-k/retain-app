import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { formatDate, formatMoney } from '../utils/format';
import type { ExpenseSummaryItem } from '../types';

interface RecentExpensesProps {
  items: ExpenseSummaryItem[];
}

export default function RecentExpenses({ items }: RecentExpensesProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Recently added</Typography>

      {items.length === 0 ? (
        <>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Nothing here yet.</Typography>
          <Button variant="contained" component={RouterLink} to="/expenses">Add your first expense</Button>
        </>
      ) : (
        <>
          {items.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider />}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.5 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.categoryName} · {formatDate(item.spentOn)}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatMoney(item.amount)}</Typography>
              </Box>
            </Box>
          ))}
          <Button component={RouterLink} to="/expenses" sx={{ mt: 1 }}>View all expenses</Button>
        </>
      )}
    </Paper>
  );
}