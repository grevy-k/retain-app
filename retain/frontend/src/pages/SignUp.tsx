import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material';
import AuthLayout from '../components/AuthLayout';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';

export default function SignUp() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
// Check if the confirm password field is filled and doesn't match the password.

  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validate the form fields before submitting.
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      // Call the signUp function from the auth context to create a new account.
      await signUp(name, email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your spending in a minute.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

        <TextField
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          autoComplete="name"
          autoFocus
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          autoComplete="email"
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          helperText="At least 8 characters"
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={passwordsMismatch}
          helperText={passwordsMismatch ? 'Passwords do not match' : undefined}
          autoComplete="new-password"
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ mt: 2 }}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/signin">Sign in</Link>
      </Typography>
    </AuthLayout>
  );
}