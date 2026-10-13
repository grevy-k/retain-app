import type { PaymentMethod, SortOption } from './types';

// Values must match the backend's allowed payment methods exactly.
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'other', label: 'Other' },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Highest amount' },
  { value: 'amount_asc', label: 'Lowest amount' },
];

// Turns 'mobile_money' into 'Mobile money' for display.
export function paymentLabel(value: PaymentMethod): string {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label ?? value;
}