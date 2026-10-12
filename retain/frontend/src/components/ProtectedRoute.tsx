import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FullPageSpinner from './FullPageSpinner';

// Wraps every page that needs a signed-in user.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If we're still checking the session, show a spinner. This can happen on page load while we check a saved token.
  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    // If the user is not signed in, send them to the sign-in page. 
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}