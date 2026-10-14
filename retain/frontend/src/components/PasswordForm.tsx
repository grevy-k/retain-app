import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button } from '@mui/material';
import PasswordField from './PasswordField';
import { apiRequest, getErrorMessage } from '../api/client';

interface PasswordFormProps {
  onSaved: (message: string) => void;
}

export default function PasswordForm({ onSaved }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Live check: only flag a mismatch once they've started typing the confirmation.
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all three fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Your new password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/account/password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
      // The password was changed successfully. Clear the form and show a success message.
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSaved('Password updated');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      <PasswordField
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
      />
      <PasswordField
        label="New password"
        value={newPassword}
        onChange={setNewPassword}
        helperText="At least 8 characters"
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={mismatch}
        helperText={mismatch ? 'Passwords do not match' : undefined}
        autoComplete="new-password"
      />

      <Button type="submit" variant="contained" disabled={submitting} sx={{ mt: 1 }}>
        {submitting ? 'Updating…' : 'Update password'}
      </Button>
    </Box>
  );
}