import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', p: 2 }}>
      <Box>
        <Typography variant="h3" gutterBottom>404</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>That page doesn't exist.</Typography>
        <Button variant="contained" component={RouterLink} to="/dashboard">Go to dashboard</Button>
      </Box>
    </Box>
  );
}