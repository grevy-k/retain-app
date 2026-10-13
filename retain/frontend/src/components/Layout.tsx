import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../store/hooks';
import { resetFilters } from '../store/filtersSlice';

// The frame around every signed-in page: top bar, navigation, and the page content.
export default function Layout() {
  const { user, isAdmin, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // The Admin link only exists for admins.
  const links = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Expenses', to: '/expenses' },
    ...(isAdmin ? [{ label: 'Admin', to: '/admin' }] : []),
  ];

  // Signing out also clears the filters, so the next person starts fresh.
  function handleSignOut() {
    signOut();
    dispatch(resetFilters());
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          {/* Hamburger button: phones only */}
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation menu"
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, mr: 1 }}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, mr: 3 }}>
            Retain
          </Typography>

          {/* Full navigation: tablets and up. NavLink adds an "active" class to the current page. */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, flexGrow: 1 }}>
            {links.map((link) => (
              <Button
                key={link.to}
                color="inherit"
                component={NavLink}
                to={link.to}
                sx={{ '&.active': { bgcolor: 'rgba(255,255,255,0.18)' } }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Spacer so Sign out stays on the right on phones */}
          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />

          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>
            {user?.name}
          </Typography>
          <Button color="inherit" variant="outlined" size="small" onClick={handleSignOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
        {links.map((link) => (
          <MenuItem key={link.to} component={NavLink} to={link.to} onClick={() => setMenuAnchor(null)}>
            {link.label}
          </MenuItem>
        ))}
      </Menu>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}