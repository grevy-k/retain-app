import type { ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';

interface SettingsSectionProps {
  title: string;
  description?: string;
  danger?: boolean; // red border for destructive actions
  children: ReactNode;
}

// The card every settings group sits in, so they all look the same.
export default function SettingsSection({ title, description, danger = false, children }: SettingsSectionProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, ...(danger && { borderColor: 'error.main' }) }}>
      <Typography variant="h6" color={danger ? 'error' : 'inherit'}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {children}
    </Paper>
  );
}