import { Paper, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string;
  caption?: string;
  tone?: 'default' | 'danger' | 'highlight'; 
}

// One headline number with a label and a short explanation underneath.
export default function StatCard({ label, value, caption, tone = 'default' }: StatCardProps) {
  const highlighted = tone === 'highlight';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        ...(highlighted && {
          // Highlighted cards are used for the "safe to spend today" number, which is the most important one on the dashboard.
          color: '#ffffff',
          border: 'none',
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
        }),
      }}
    >
      <Typography variant="body2" sx={{ opacity: highlighted ? 0.85 : 1 }} color={highlighted ? 'inherit' : 'text.secondary'}>
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mt: 0.5, wordBreak: 'break-word' }}
        color={tone === 'danger' ? 'error' : 'inherit'}
      >
        {value}
      </Typography>
      {caption && (
        <Typography variant="body2" sx={{ mt: 0.5, opacity: highlighted ? 0.85 : 1 }} color={highlighted ? 'inherit' : 'text.secondary'}>
          {caption}
        </Typography>
      )}
    </Paper>
  );
}