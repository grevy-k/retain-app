import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useThemeMode } from '../hooks/useThemeMode';
import type { ThemePreference } from '../context/themeModeContext';

export default function AppearanceSettings() {
  const { preference, setPreference } = useThemeMode();

  return (
    <ToggleButtonGroup
      exclusive
      value={preference}
      aria-label="Theme"
      // Clicking the already selected button reports null; ignore that so one option is always chosen.
      onChange={(_event, value: ThemePreference | null) => {
        if (value) setPreference(value);
      }}
    >
      <ToggleButton value="light">Light</ToggleButton>
      <ToggleButton value="dark">Dark</ToggleButton>
      <ToggleButton value="system">System</ToggleButton>
    </ToggleButtonGroup>
  );
}