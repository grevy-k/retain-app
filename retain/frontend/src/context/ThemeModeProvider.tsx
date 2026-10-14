import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { ThemeModeContext } from './themeModeContext';
import type { ThemeModeContextValue } from './themeModeContext';
import { buildTheme } from '../theme';

const STORAGE_KEY = 'retain_theme_mode';

// A saved choice wins. With none saved, follow the device's light/dark setting.
function getInitialMode(): PaletteMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Owns the current mode and applies the matching MUI theme to everything inside it.
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  // Initialize the theme mode based on the user's preference or the device's default.
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  const toggleMode = useCallback(() => {
    const next: PaletteMode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next); // remember the explicit choice
  }, [mode]);

  // Rebuild the theme only when the mode actually changes.
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo<ThemeModeContextValue>(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {/* Apply the theme to the entire application */}
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}