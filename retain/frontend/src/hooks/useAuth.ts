import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

// Shortcut so components write useAuth() instead of useContext(AuthContext).
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}