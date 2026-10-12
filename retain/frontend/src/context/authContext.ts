import { createContext } from 'react';
import type { User } from '../types';

// Everything a component can read from or call on the auth context.
export interface AuthContextValue {
  user: User | null;
  isLoading: boolean; // true while we check a saved token on page load
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

// null default: useAuth() will throw a clear error if used outside the provider.
export const AuthContext = createContext<AuthContextValue | null>(null);