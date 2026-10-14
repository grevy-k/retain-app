import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// Builds Retain's theme for either mode. Light and dark share the same shape and fonts,
// and differ only in palette: dark uses a lighter teal so it stays readable on dark surfaces.
export function buildTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: isDark ? { main: '#2dd4bf', contrastText: '#042f2e' } : { main: '#0f766e' },
      secondary: { main: '#f59e0b' },
      background: isDark ? { default: '#090d16', paper: '#15211f' } : { default: '#f4f7f6' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      h4: { fontWeight: 700 },
    },
    components: {
      // The top bar stays brand teal with white text in both modes.
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: { backgroundColor: '#0f766e', color: '#ffffff' },
        },
      },
    },
  });
}