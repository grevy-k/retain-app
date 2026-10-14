import { useState } from 'react';
import { Alert, Button } from '@mui/material';
import { downloadFile, getErrorMessage } from '../api/client';

interface DataExportProps {
  onDone: (message: string) => void;
}

export default function DataExport({ onDone }: DataExportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    setLoading(true);
    try {
      await downloadFile('/account/export', 'retain-expenses.csv');
      onDone('Your expenses were downloaded');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button variant="outlined" onClick={handleDownload} disabled={loading}>
        {loading ? 'Preparing file…' : 'Download my expenses (CSV)'}
      </Button>
    </>
  );
}