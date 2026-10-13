import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { apiRequest, getErrorMessage } from '../api/client';
import { formatMoney } from '../utils/format';
import type { Expense } from '../types';

interface DeleteExpenseDialogProps {
  expense: Expense;
  onCancel: () => void;
  onDeleted: () => void;
}

// Deleting can't be undone, so we always ask first.
export default function DeleteExpenseDialog({ expense, onCancel, onDeleted }: DeleteExpenseDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest(`/expenses/${expense.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={submitting ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Delete this expense?</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <DialogContentText>
          “{expense.title}” ({formatMoney(expense.amount)}) will be permanently removed. This can't be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button color="error" variant="contained" onClick={handleDelete} disabled={submitting}>
          {submitting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}