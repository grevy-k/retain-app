import { createContext } from 'react';
import type { PaletteMode } from '@mui/material';

// What the user CHOSE. 'system' means "follow my device".
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeModeContextValue {
  mode: PaletteMode; // what is actually showing right now: 'light' | 'dark'
  preference: ThemePreference; // what the user picked
  setPreference: (preference: ThemePreference) => void;
  toggleMode: () => void; // quick light/dark flip used by the top-bar button
}

// null default: useThemeMode() throws a clear error if used outside the provider.
export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);