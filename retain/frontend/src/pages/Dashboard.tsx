import { Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Typography variant="h4" gutterBottom>Welcome back, {user?.name}</Typography>
      <Typography color="text.secondary">
        Signed in as {user?.email} with role: <strong>{user?.role}</strong>
      </Typography>
    </>
  );
}