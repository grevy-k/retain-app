import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { apiRequest, getErrorMessage } from '../api/client';
import { formatMonth } from '../utils/format';

interface BudgetDialogProps {
  month: string;
  currentBudget: number | null; // pre-fills the field when editing
  onClose: () => void;
  onSaved: (message: string) => void;
}

// The parent mounts this only while open, so the field starts fresh each time.
export default function BudgetDialog({ month, currentBudget, onClose, onSaved }: BudgetDialogProps) {
  const [amount, setAmount] = useState(currentBudget !== null ? String(currentBudget) : '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value <= 0) {
      setFieldError('Enter a budget greater than 0.');
      return;
    }
    setFieldError(null);

    setSubmitting(true);
    try {
      // PUT creates the budget if there isn't one for this month, or updates it if there is.
      await apiRequest(`/budgets/${month}`, { method: 'PUT', body: { amount: value } });
      onSaved('Budget saved');
    } catch (err) {
      setFormError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{currentBudget !== null ? 'Edit budget' : 'Set budget'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            How much do you want to spend in {formatMonth(month)}?
          </DialogContentText>
          {formError && <Alert severity="error" sx={{ mb: 1 }}>{formError}</Alert>}
          <TextField
            label="Monthly budget"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={fieldError !== null}
            helperText={fieldError ?? undefined}
            fullWidth
            autoFocus
            margin="normal"
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save budget'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}