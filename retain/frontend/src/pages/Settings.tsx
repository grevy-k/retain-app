import { useState } from 'react';
import { Box, Chip, Snackbar, Typography } from '@mui/material';
import AppearanceSettings from '../components/AppearanceSettings';
import DataExport from '../components/DataExport';
import DeleteAccountSection from '../components/DeleteAccountSection';
import PasswordForm from '../components/PasswordForm';
import ProfileForm from '../components/ProfileForm';
import SettingsSection from '../components/SettingsSection';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  return (
    // A narrower column reads better for forms than the full page width.
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
        <Typography variant="h4">Settings</Typography>
        {user?.role === 'admin' && <Chip size="small" color="primary" label="Admin" />}
      </Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your account, appearance and data.
      </Typography>

      <SettingsSection title="Profile" description="How your name appears in Retain.">
        <ProfileForm onSaved={setToast} />
      </SettingsSection>

      <SettingsSection title="Change Password" description="Use at least 8 characters. You'll need your current password.">
        <PasswordForm onSaved={setToast} />
      </SettingsSection>

      <SettingsSection title="Appearance" description="System follows your device's light or dark setting.">
        <AppearanceSettings />
      </SettingsSection>

      <SettingsSection title="Your data" description="Download every expense you've recorded as a spreadsheet-friendly CSV file.">
        <DataExport onDone={setToast} />
      </SettingsSection>

      <SettingsSection
        danger
        title="Delete account"
        description="Permanently remove your account and all of its expenses and budgets."
      >
        <DeleteAccountSection />
      </SettingsSection>

      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}