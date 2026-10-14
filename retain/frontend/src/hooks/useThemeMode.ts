import { useContext } from 'react';
import { ThemeModeContext } from '../context/themeModeContext';

// Shortcut so components write useThemeMode() instead of useContext(ThemeModeContext).
export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used inside <ThemeModeProvider>.');
  }
  return context;
}