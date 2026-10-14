import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { apiRequest, getErrorMessage } from '../api/client';
import type { Category } from '../types';

interface CategoryFormDialogProps {
  category: Category | null; 
  onClose: () => void;
  onSaved: (message: string) => void;
}

// The parent only mounts this while it's open, so the field starts fresh each time.
export default function CategoryFormDialog({ category, onClose, onSaved }: CategoryFormDialogProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a category name.');
      return;
    }
    if (trimmed.length > 50) {
      setError('Keep the name under 50 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (category) {
        await apiRequest(`/categories/${category.id}`, { method: 'PUT', body: { name: trimmed } });
        onSaved('Category renamed');
      } else {
        await apiRequest('/categories', { method: 'POST', body: { name: trimmed } });
        onSaved('Category created');
      }
    } catch (err) {
      // Includes the server's "That category already exists." message.
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{category ? 'Rename category' : 'New category'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
          <TextField
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : category ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}