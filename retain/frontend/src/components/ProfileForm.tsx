import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, TextField } from '@mui/material';
import { apiRequest, getErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

interface ProfileFormProps {
  onSaved: (message: string) => void;
}

export default function ProfileForm({ onSaved }: ProfileFormProps) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Nothing to save until the name actually differs.
  const unchanged = name.trim() === user?.name;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest<{ user: User }>('/account/profile', {
        method: 'PUT',
        body: { name: name.trim() },
      });
      updateUser(data.user); // the top bar updates immediately
      setName(data.user.name);
      onSaved('Name updated');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      <TextField
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        autoComplete="name"
      />
      <TextField
        label="Email"
        value={user?.email ?? ''}
        fullWidth
        margin="normal"
        disabled
        helperText="Your email is how you sign in, so it can't be changed here."
      />

      <Button type="submit" variant="contained" disabled={submitting || unchanged} sx={{ mt: 1 }}>
        {submitting ? 'Saving…' : 'Save name'}
      </Button>
    </Box>
  );
}