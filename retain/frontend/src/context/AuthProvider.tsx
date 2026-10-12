import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';
import { apiRequest, setUnauthorizedHandler } from '../api/client';
import { tokenStore } from '../api/tokenStore';
import type { AuthResponse, User } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // true while we check a saved token on page load. If we don't have a saved token, we can skip the check and start with false.
  const [isLoading, setIsLoading] = useState<boolean>(() => tokenStore.get() !== null);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Let the API client sign us out automatically if the server rejects our token.
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // Restore the session on first load: ask the server who the saved token belongs to.
  useEffect(() => {
    if (!tokenStore.get()) return;

    let cancelled = false; // ignore the result if the component unmounted meanwhile

    apiRequest<{ user: User }>('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => tokenStore.clear()) // invalid or expired token: forget it
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: { email, password },
    });
    tokenStore.set(data.token);
    setUser(data.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
    tokenStore.set(data.token);
    setUser(data.user);
  }, []);

  // useMemo so consumers only re-render when something they read actually changes.
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}