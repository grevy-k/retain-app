import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

// Shared card used by both sign-in and sign-up so they look consistent.
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
      }}
    >
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
          Retain
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Keep more of what you earn.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}