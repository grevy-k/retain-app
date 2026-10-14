import { useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  LinearProgress, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useApi } from '../hooks/useApi';
import { formatTimestamp } from '../utils/format';
import type { AdminUsersResponse } from '../types';

const PAGE_SIZE = 10;

interface AllUsersDialogProps {
  onClose: () => void;
}

// A paginated list of every registered user. Opened from the admin Insights tab.
export default function AllUsersDialog({ onClose }: AllUsersDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // phones get a full-screen view
  const [page, setPage] = useState(1);

  // Changing the page changes the path, which makes useApi fetch that page.
  const { data, isLoading, error, reload } = useApi<AdminUsersResponse>(
    `/admin/users?page=${page}&limit=${PAGE_SIZE}`
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
    <Dialog open onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
      <DialogTitle>
        All users
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
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Expenses</TableCell>
                    {/* The least essential column hides on small screens to save space */}
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? <Chip size="small" color="primary" label="Admin" /> : <Chip size="small" label="User" />}
                      </TableCell>
                      <TableCell align="right">{user.expenseCount.toLocaleString()}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, whiteSpace: 'nowrap' }}>
                        {formatTimestamp(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {data.users.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No users yet.
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