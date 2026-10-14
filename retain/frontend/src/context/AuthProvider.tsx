import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';
import { apiRequest, setUnauthorizedHandler } from '../api/client';
import { tokenStore } from '../api/tokenStore';
import type { AuthResponse, User } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // The app is loading while we check for a saved token and ask the server who it belongs to.
  const [isLoading, setIsLoading] = useState<boolean>(() => tokenStore.get() !== null);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // If the API client gets a 401 while holding a token, it means the token is invalid or expired. Sign the user out automatically.
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // On page load, if we have a saved token, ask the server who it belongs to. If it's invalid or expired, forget it.
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

  // Replaces the stored user with a fresh copy from the server (e.g. after a name change).
  const updateUser = useCallback((updated: User) => setUser(updated), []);

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
      updateUser,
    }),
    [user, isLoading, signIn, signUp, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}