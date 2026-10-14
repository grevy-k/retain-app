import { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  LinearProgress, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useApi } from '../hooks/useApi';
import { formatDate, formatMoney, formatTimestamp } from '../utils/format';
import type { AdminExpensesResponse } from '../types';

const PAGE_SIZE = 10;

interface AllExpensesDialogProps {
  onClose: () => void;
}

// A paginated list of every expense on the platform. Opened from the admin Insights tab.
export default function AllExpensesDialog({ onClose }: AllExpensesDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // phones get a full-screen view
  const [page, setPage] = useState(1);

  // Changing the page changes the path, which makes useApi fetch that page.
  const { data, isLoading, error, reload } = useApi<AdminExpensesResponse>(
    `/admin/expenses?page=${page}&limit=${PAGE_SIZE}`
  );

  const pagination = data?.pagination;
  const rangeText =
    pagination && pagination.total > 0
      ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
          pagination.page * pagination.limit,
          pagination.total
        )} of ${pagination.total}`
      : '';

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg" fullScreen={fullScreen}>
      <DialogTitle>
        All expenses
        {rangeText && (
          <Typography variant="body2" color="text.secondary">
            {rangeText}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {/* First load only: nothing to show yet */}
        {!data && isLoading && (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {data && (
          <>
            {/* Thin bar while the next page loads; the old rows stay visible underneath */}
            <Box sx={{ height: 4, mb: 1 }}>{isLoading && <LinearProgress />}</Box>

            <TableContainer sx={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    {/* The least essential column hides on small screens to save space */}
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Added</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.expenses.map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(expense.spentOn)}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{expense.title}</TableCell>
                      <TableCell>{expense.userName}</TableCell>
                      <TableCell>{expense.categoryName}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatMoney(expense.amount)}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, whiteSpace: 'nowrap' }}>
                        {formatTimestamp(expense.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {data.expenses.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No expenses recorded yet.
              </Typography>
            )}

            {pagination && pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  color="primary"
                  onChange={(_event, value) => setPage(value)}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}