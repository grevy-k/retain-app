// This file provides a simple interface for storing and 
// retrieving the authentication token in localStorage. 
const TOKEN_KEY = 'retain_token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};