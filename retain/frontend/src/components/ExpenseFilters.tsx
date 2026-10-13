import { Box, Button, IconButton, InputAdornment, MenuItem, Paper, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { PAYMENT_METHODS, SORT_OPTIONS } from '../constants';
import { resetFilters, selectActiveFilterCount, selectFilters, updateFilters } from '../store/filtersSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Category, PaymentMethod, SortOption } from '../types';

interface ExpenseFiltersProps {
  categories: Category[];
}

// Every control here reads from Redux and writes to Redux, nothing is kept in local state.
export default function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const activeCount = useAppSelector(selectActiveFilterCount);

  // Catch impossible ranges early so an empty result isn't a mystery.
  const dateRangeInvalid = filters.from !== '' && filters.to !== '' && filters.from > filters.to;
  const amountRangeInvalid =
    filters.minAmount !== '' && filters.maxAmount !== '' && Number(filters.minAmount) > Number(filters.maxAmount);

  // Select boxes with an "All" option need the label pinned above, or it overlaps the empty value.
  const pinnedLabel = { inputLabel: { shrink: true }, select: { displayEmpty: true } };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        <TextField
          label="Search"
          placeholder="Title or notes"
          value={filters.search}
          onChange={(e) => dispatch(updateFilters({ search: e.target.value }))}
          sx={{ gridColumn: { md: 'span 2' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={() => dispatch(updateFilters({ search: '' }))}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        <TextField
          select
          label="Category"
          value={filters.categoryId}
          onChange={(e) => dispatch(updateFilters({ categoryId: e.target.value }))}
          slotProps={pinnedLabel}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={String(category.id)}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Payment method"
          value={filters.paymentMethod}
          onChange={(e) => dispatch(updateFilters({ paymentMethod: e.target.value as PaymentMethod | '' }))}
          slotProps={pinnedLabel}
        >
          <MenuItem value="">All methods</MenuItem>
          {PAYMENT_METHODS.map((method) => (
            <MenuItem key={method.value} value={method.value}>
              {method.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="From date"
          type="date"
          value={filters.from}
          onChange={(e) => dispatch(updateFilters({ from: e.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To date"
          type="date"
          value={filters.to}
          onChange={(e) => dispatch(updateFilters({ to: e.target.value }))}
          error={dateRangeInvalid}
          helperText={dateRangeInvalid ? 'End date is before the start date' : undefined}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Min amount"
          type="number"
          value={filters.minAmount}
          onChange={(e) => dispatch(updateFilters({ minAmount: e.target.value }))}
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <TextField
          label="Max amount"
          type="number"
          value={filters.maxAmount}
          onChange={(e) => dispatch(updateFilters({ maxAmount: e.target.value }))}
          error={amountRangeInvalid}
          helperText={amountRangeInvalid ? 'Max is lower than min' : undefined}
          slotProps={{ htmlInput: { min: 0 } }}
        />

        <TextField
          select
          label="Sort by"
          value={filters.sort}
          onChange={(e) => dispatch(updateFilters({ sort: e.target.value as SortOption }))}
          sx={{ gridColumn: { md: 'span 2' } }}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
          <Button
            variant="outlined"
            onClick={() => dispatch(resetFilters())}
            disabled={activeCount === 0}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            {activeCount > 0 ? `Clear filters (${activeCount})` : 'Clear filters'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}