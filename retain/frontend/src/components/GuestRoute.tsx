import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FullPageSpinner from './FullPageSpinner';

// Wraps every page that needs a signed-out visitor.
export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (isAuthenticated) {
    // If the user is signed in, send them back to where they were going (or the dashboard if we don't know).
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    return <Navigate to={from ?? '/dashboard'} replace />;
  }

  return <Outlet />;
}