import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import PasswordField from './PasswordField';
import { apiRequest, getErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { resetFilters } from '../store/filtersSlice';
import { useAppDispatch } from '../store/hooks';

export default function DeleteAccountSection() {
  const { signOut } = useAuth();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function closeDialog() {
    setOpen(false);
    setPassword('');
    setError(null);
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!password) {
      setError('Enter your password to confirm.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/account', { method: 'DELETE', body: { password } });
      // The account is gone. Sign the user out and clear any filters they had set.
      signOut();
      dispatch(resetFilters());
    } catch (err) {
      // The server rejected the deletion. It might be because the password was wrong, or because the account was already deleted (say, by an admin). Either way, we don't want to leave the user signed in.
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button color="error" variant="outlined" onClick={() => setOpen(true)}>
        Delete my account
      </Button>

      <Dialog open={open} onClose={submitting ? undefined : closeDialog} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleDelete} noValidate>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 1 }}>
              This permanently deletes your account, every expense you've recorded, and your budgets.
              It can't be undone.
            </DialogContentText>
            {error && <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>}
            <PasswordField
              label="Enter your password to confirm"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} disabled={submitting}>Cancel</Button>
            <Button type="submit" color="error" variant="contained" disabled={submitting}>
              {submitting ? 'Deleting…' : 'Delete forever'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}