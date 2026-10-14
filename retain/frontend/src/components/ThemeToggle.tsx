import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../hooks/useThemeMode';

// Shows the icon of the mode you'd switch TO: a sun while in dark mode, a moon while in light mode.
export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" aria-label={label} onClick={toggleMode}>
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}