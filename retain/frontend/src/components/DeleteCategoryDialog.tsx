import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { apiRequest, getErrorMessage } from '../api/client';
import type { Category } from '../types';

interface DeleteCategoryDialogProps {
  category: Category;
  onCancel: () => void;
  onDeleted: (message: string) => void;
}

export default function DeleteCategoryDialog({ category, onCancel, onDeleted }: DeleteCategoryDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    try {
      // The server moves this category's expenses to "Uncategorized" and tells us how many.
      const result = await apiRequest<{ expensesMoved: number }>(`/categories/${category.id}`, {
        method: 'DELETE',
      });
      const moved = result.expensesMoved;
      onDeleted(
        moved > 0
          ? `Category deleted. ${moved} ${moved === 1 ? 'expense' : 'expenses'} moved to Uncategorized.`
          : 'Category deleted.'
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={submitting ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Delete “{category.name}”?</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <DialogContentText>
          Any expenses using this category will be moved to “Uncategorized”, so nobody loses their spending history.
          The category itself can't be recovered.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button color="error" variant="contained" onClick={handleDelete} disabled={submitting}>
          {submitting ? 'Deleting…' : 'Delete category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}