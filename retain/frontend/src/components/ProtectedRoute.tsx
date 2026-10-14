import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FullPageSpinner from './FullPageSpinner';

// Wraps every page that needs a signed-in user.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // While we check for a saved token on page load, show a spinner instead of flashing the sign-in screen.
  if (isLoading) return <FullPageSpinner />;

  // If the user isn't signed in, send them to the sign-in page.
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}