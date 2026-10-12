import { Box, CircularProgress } from '@mui/material';

// Shown while we're still checking whether the saved login is valid.
export default function FullPageSpinner() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}