import {
  Box, Card, CardContent, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { paymentLabel } from '../constants';
import { formatDate, formatMoney } from '../utils/format';
import type { Expense } from '../types';
import { Link as RouterLink } from 'react-router-dom';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, isLoading, onEdit, onDelete }: ExpenseListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fade the old rows while new ones load, instead of blanking the screen.
  const loadingStyle = { opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' };

  // Edit and delete buttons, shared by the table and the cards.
  const actions = (expense: Expense) => (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label={`Edit ${expense.title}`} onClick={() => onEdit(expense)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" aria-label={`Delete ${expense.title}`} onClick={() => onDelete(expense)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );

  // Phones: one card per expense.
  if (isMobile) {
    return (
      <Stack spacing={1.5} sx={loadingStyle}>
        {expenses.map((expense) => (
          <Card key={expense.id} variant="outlined">
            <CardContent sx={{ pb: '12px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography
                  component={RouterLink}
                  to={`/expenses/${expense.id}`}
                  sx={{
                    fontWeight: 600,
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'block',
                    '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                  }}
                >
                  {expense.title}
                </Typography>
                <Typography sx={{ fontWeight: 700 }} color="primary">
                  {formatMoney(expense.amount)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatDate(expense.spentOn)} · {paymentLabel(expense.paymentMethod)}
              </Typography>
              {expense.notes && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {expense.notes}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Chip size="small" label={expense.categoryName} />
                <Box>{actions(expense)}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // Tablets and desktops: a table.
  return (
    <TableContainer component={Paper} variant="outlined" sx={loadingStyle}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(expense.spentOn)}</TableCell>
              <TableCell>
                <Typography
                  component={RouterLink}
                  to={`/expenses/${expense.id}`}
                  sx={{
                    fontWeight: 600,
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'block',
                    '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                  }}
                >
                  {expense.title}
                </Typography>
                {expense.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {expense.notes}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip size="small" label={expense.categoryName} />
              </TableCell>
              <TableCell>{paymentLabel(expense.paymentMethod)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {formatMoney(expense.amount)}
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {actions(expense)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}