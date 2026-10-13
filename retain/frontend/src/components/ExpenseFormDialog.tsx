import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { apiRequest, getErrorMessage } from '../api/client';
import { PAYMENT_METHODS } from '../constants';
import { todayISO } from '../utils/format';
import type { Category, Expense, PaymentMethod } from '../types';

interface ExpenseFormDialogProps {
  categories: Category[];
  expense: Expense | null; // null = adding a new one, otherwise editing this one
  onClose: () => void;
  onSaved: (message: string) => void;
}

type FieldErrors = Partial<Record<'title' | 'amount' | 'categoryId' | 'spentOn', string>>;

// The parent only mounts this dialog while it's open, so the form starts fresh each time.
export default function ExpenseFormDialog({ categories, expense, onClose, onSaved }: ExpenseFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // phones get a full-screen form

  // Start from the expense being edited, or sensible blanks for a new one.
  const [title, setTitle] = useState(expense?.title ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [categoryId, setCategoryId] = useState(expense ? String(expense.categoryId) : '');
  const [spentOn, setSpentOn] = useState(expense?.spentOn ?? todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(expense?.paymentMethod ?? 'cash');
  const [notes, setNotes] = useState(expense?.notes ?? '');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Same rules as the backend, so mistakes are caught before a request is sent.
  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = 'Give this expense a title.';
    else if (title.trim().length > 120) errors.title = 'Keep the title under 120 characters.';

    const amountNumber = Number(amount);
    if (!amount || !Number.isFinite(amountNumber) || amountNumber <= 0) {
      errors.amount = 'Enter an amount greater than 0.';
    }
    if (!categoryId) errors.categoryId = 'Pick a category.';
    if (!spentOn) errors.spentOn = 'Pick a date.';
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const body = {
      title: title.trim(),
      amount: Number(amount),
      categoryId: Number(categoryId),
      spentOn,
      paymentMethod,
      notes: notes.trim(),
    };

    setSubmitting(true);
    try {
      if (expense) {
        await apiRequest(`/expenses/${expense.id}`, { method: 'PUT', body });
        onSaved('Expense updated');
      } else {
        await apiRequest('/expenses', { method: 'POST', body });
        onSaved('Expense added');
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose} // don't allow closing mid-save
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{expense ? 'Edit expense' : 'Add expense'}</DialogTitle>

        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 1 }}>{formError}</Alert>}

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title}
            fullWidth
            margin="normal"
            autoFocus
          />

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={Boolean(fieldErrors.amount)}
              helperText={fieldErrors.amount}
              margin="normal"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
            <TextField
              label="Date"
              type="date"
              value={spentOn}
              onChange={(e) => setSpentOn(e.target.value)}
              error={Boolean(fieldErrors.spentOn)}
              helperText={fieldErrors.spentOn}
              margin="normal"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              error={Boolean(fieldErrors.categoryId)}
              helperText={fieldErrors.categoryId}
              disabled={categories.length === 0}
              margin="normal"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Payment method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              margin="normal"
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}