import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FullPageSpinner from './FullPageSpinner';

// The opposite of ProtectedRoute: sign-in and sign-up pages are for signed-out people only.
export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  // Once signed in (or signed up), everyone lands on the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}