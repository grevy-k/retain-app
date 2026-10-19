import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ThemeToggle from './ThemeToggle';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16, color: '#ffffff' }}>
        <ThemeToggle />
      </Box>

      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
        }}
      >
        {/* Retain logo and brand */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box
            component="img"
            src="/retain-logo-t.png"
            alt="Retain logo"
            sx={{
              width: 76,
              height: 76,
              objectFit: 'contain',
              mb: 0,
            }}
          />
        </Box>

        <Typography variant="h6" sx={{ mt: 0 }}>
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