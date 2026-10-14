import { createContext } from 'react';
import type { PaletteMode } from '@mui/material';

export interface ThemeModeContextValue {
  mode: PaletteMode; // 'light' | 'dark'
  toggleMode: () => void;
}

// null default: useThemeMode() throws a clear error if used outside the provider.
export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);