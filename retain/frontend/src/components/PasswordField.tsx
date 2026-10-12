
import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  helperText?: string;
  error?: boolean;
}

export default function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  helperText,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      helperText={helperText}
      error={error}
      fullWidth
      margin="normal"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                onClick={() => setVisible((current) => !current)}
                onMouseDown={(e) => e.preventDefault()}
                onKeyDown={(e) => e.stopPropagation()}
                size="small"
                sx={{
                  color: 'text.secondary',
                  mr: -0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {visible ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

