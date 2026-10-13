import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMethod, SortOption } from '../types';
import type { RootState } from './index';

//Filters state and reducers: the "data" part of filtering lives here, not in components
export interface FiltersState {
  search: string;
  categoryId: string;
  paymentMethod: PaymentMethod | '';
  from: string; // 'YYYY-MM-DD'
  to: string;
  minAmount: string;
  maxAmount: string;
  sort: SortOption;
  page: number;
  limit: number;
}

const initialState: FiltersState = {
  search: '',
  categoryId: '',
  paymentMethod: '',
  from: '',
  to: '',
  minAmount: '',
  maxAmount: '',
  sort: 'date_desc',
  page: 1,
  limit: 10,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Update any subset of filters (except page and limit). Reset page to 1 whenever filters change.
    updateFilters(state, action: PayloadAction<Partial<Omit<FiltersState, 'page' | 'limit'>>>) {
      Object.assign(state, action.payload);
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { updateFilters, setPage, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;

// Selectors for reading filter state from the store. Components should use these instead of reading state.filters directly.

export const selectFilters = (state: RootState) => state.filters;

// How many filters are switched on (sorting and paging don't count). Drives the "Clear filters" button.
export const selectActiveFilterCount = (state: RootState): number => {
  const f = state.filters;
  return [f.search.trim(), f.categoryId, f.paymentMethod, f.from, f.to, f.minAmount, f.maxAmount].filter(
    (value) => value !== ''
  ).length;
};

// Convert the filters state into a query string for the API. The API ignores any missing filters, so we don't need to send them.
export function toQueryString(filters: FiltersState): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.minAmount) params.set('minAmount', filters.minAmount);
  if (filters.maxAmount) params.set('maxAmount', filters.maxAmount);

  params.set('sort', filters.sort);
  params.set('page', String(filters.page));
  params.set('limit', String(filters.limit));

  return params.toString();
}