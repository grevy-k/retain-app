import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Snackbar, Typography } from '@mui/material';
import DeleteExpenseDialog from '../components/DeleteExpenseDialog';
import ExpenseFormDialog from '../components/ExpenseFormDialog';
import { paymentLabel } from '../constants';
import { useApi } from '../hooks/useApi';
import { formatDate, formatMoney } from '../utils/format';
import type { Category, Expense } from '../types';

// A small label-over-value pair used for each detail.
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {/* pre-wrap keeps line breaks the user typed into their notes */}
      <Typography sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>
    </Box>
  );
}

// Shows one expense in full. Reached from the expense list at /expenses/:id.
export default function ExpenseDetail() {
  const { id } = useParams(); // the :id from the URL
  const navigate = useNavigate();

  const { data, isLoading, error, reload } = useApi<{ expense: Expense }>(`/expenses/${id}`);
  // The edit form needs the category list for its dropdown.
  const categoriesResult = useApi<{ categories: Category[] }>('/categories');
  const categories = categoriesResult.data?.categories ?? null;

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleSaved(message: string) {
    setEditing(false);
    setToast(message);
    reload(); // show the updated values
  }

  // Covers "not found" too: the API answers 404 for ids that don't exist or belong to someone else.
  if (error) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={RouterLink} to="/expenses">Back to expenses</Button>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const expense = data.expense;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      <Button component={RouterLink} to="/expenses" sx={{ mb: 2 }}>
        ← Back to expenses
      </Button>

      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4">{expense.title}</Typography>
            <Chip size="small" label={expense.categoryName} sx={{ mt: 1 }} />
          </Box>
          <Typography variant="h4" color="primary">{formatMoney(expense.amount)}</Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
          <Detail label="Date" value={formatDate(expense.spentOn)} />
          <Detail label="Payment method" value={paymentLabel(expense.paymentMethod)} />
          <Box sx={{ gridColumn: { sm: 'span 2' } }}>
            <Detail label="Notes" value={expense.notes || 'No notes added.'} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexWrap: 'wrap' }}>
          {/* Disabled until categories arrive, so the form's dropdown is never empty */}
          <Button variant="contained" onClick={() => setEditing(true)} disabled={!categories}>
            Edit
          </Button>
          <Button color="error" variant="outlined" onClick={() => setDeleting(true)}>
            Delete
          </Button>
        </Box>
      </Paper>

      {editing && categories && (
        <ExpenseFormDialog
          categories={categories}
          expense={expense}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <DeleteExpenseDialog
          expense={expense}
          onCancel={() => setDeleting(false)}
          // The expense no longer exists, so leave this page.
          onDeleted={() => navigate('/expenses', { replace: true })}
        />
      )}

      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}