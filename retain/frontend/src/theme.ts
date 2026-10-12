import { createTheme } from '@mui/material/styles';

// This theme is used by MUI's ThemeProvider to style the app consistently.
export const theme = createTheme({
  palette: {
    primary: { main: '#0f766e' },
    secondary: { main: '#f59e0b' },
    background: { default: '#f4f7f6' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 700 },
  },
});