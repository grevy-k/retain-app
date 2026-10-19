
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

type BrandLogoProps = {
  showName?: boolean;
  size?: number;
};

export default function BrandLogo({
  showName = true,
  size = 40,
}: BrandLogoProps) {
  return (
    <Box
      component={Link}
      to="/dashboard"
      aria-label="Retain home"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Box
        component="img"
        src="/frontend/public/retain-logo-t.png"
        alt=""
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
        }}
      />

      {showName && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}
        >
          Retain
        </Typography>
      )}
    </Box>
  );
}