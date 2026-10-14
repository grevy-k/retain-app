import { Box, Chip, Divider, Paper, Typography } from '@mui/material';
import type { CategoryUsage } from '../types';

interface CategoryUsageListProps {
  title: string;
  subtitle: string;
  items: CategoryUsage[];
}

// A list of categories with their usage counts, shown on the dashboard.
export default function CategoryUsageList({ title, subtitle, items }: CategoryUsageListProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{subtitle}</Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">No categories yet.</Typography>
      ) : (
        items.map((item, index) => (
          <Box key={item.id}>
            {index > 0 && <Divider />}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
              <Typography sx={{ width: 20, fontWeight: 700 }} color="text.secondary">{index + 1}</Typography>
              <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>{item.category}</Typography>
              <Chip size="small" label={`${item.expenseCount} ${item.expenseCount === 1 ? 'expense' : 'expenses'}`} />
            </Box>
          </Box>
        ))
      )}
    </Paper>
  );
}