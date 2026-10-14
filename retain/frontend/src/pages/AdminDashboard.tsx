import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import CategoriesTab from '../components/CategoriesTab';
import InsightsTab from '../components/InsightsTab';

// Only reachable through AdminRoute, which checks the admin role from AuthContext.
export default function AdminDashboard() {
  const [tab, setTab] = useState<'insights' | 'categories'>('insights');

  return (
    <>
      <Typography variant="h4">Admin dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Platform insights and category management.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_event, value) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Insights" value="insights" />
        <Tab label="Categories" value="categories" />
      </Tabs>

      {/* Render the active tab's content */}
      <Box>{tab === 'insights' ? <InsightsTab /> : <CategoriesTab />}</Box>
    </>
  );
}