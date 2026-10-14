import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { ThemeModeContext } from './themeModeContext';
import type { ThemeModeContextValue, ThemePreference } from './themeModeContext';
import { buildTheme } from '../theme';

// Same key as before, so anyone who already picked light or dark keeps their choice.
const STORAGE_KEY = 'retain_theme_mode';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function getInitialPreference(): ThemePreference {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

// Owns the user's theme choice and applies the matching MUI theme to everything inside it.
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);

  // Track the device setting separately so "System" can react if it changes while the app is open.
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => window.matchMedia(DARK_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  // The mode actually shown: an explicit choice wins, otherwise follow the device.
  const mode: PaletteMode = preference === 'system' ? (systemIsDark ? 'dark' : 'light') : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  // The top-bar button always switches to the opposite of what you're seeing.
  const toggleMode = useCallback(() => {
    setPreference(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setPreference]);

  // Rebuild the theme only when the shown mode actually changes.
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, preference, setPreference, toggleMode }),
    [mode, preference, setPreference, toggleMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {/* enableColorScheme tells the browser to draw its own controls
            (date pickers, scrollbars) in dark mode too */}
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}