import { Box, Button, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { currentMonthISO, formatMonth, shiftMonth } from '../utils/format';

interface MonthPickerProps {
  month: string; // 'YYYY-MM'
  onChange: (month: string) => void;
}

// A simple month picker with left/right arrows and a "This month" button. The parent controls the state.
export default function MonthPicker({ month, onChange }: MonthPickerProps) {
  const isCurrentMonth = month === currentMonthISO();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton aria-label="Previous month" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography sx={{ minWidth: 150, textAlign: 'center', fontWeight: 600 }}>{formatMonth(month)}</Typography>
      <IconButton aria-label="Next month" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRightIcon />
      </IconButton>
      {/* A quick way home after browsing old months */}
      {!isCurrentMonth && (
        <Button size="small" onClick={() => onChange(currentMonthISO())}>
          This month
        </Button>
      )}
    </Box>
  );
}