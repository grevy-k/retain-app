// Currency comes from .env so it can be changed without touching code.
const CURRENCY = (import.meta.env.VITE_CURRENCY as string | undefined) || 'USD';

const moneyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  return moneyFormatter.format(amount);
}

// Shows '2026-10-08' as '8 Oct 2026'. We build the Date from its parts
// (instead of new Date('2026-10-08')) so timezones can never shift the day.
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Today's date as 'YYYY-MM-DD' in the user's own timezone (toISOString would use UTC).
export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// Returns the current month as 'YYYY-MM'.

export function currentMonthISO(): string {
  return todayISO().slice(0, 7);
}

// Returns the month that is delta months away from the given month, as 'YYYY-MM'.
export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split('-').map(Number);
  const shifted = new Date(year, mon - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

// '2026-10' becomes 'October 2026'.
export function formatMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

// Day 0 of next month is the last day of this month.
export function daysInMonth(month: string): number {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon, 0).getDate();
}
// Formats an ISO timestamp into a human-readable date string, e.g., '2026-10-08T14:30:00Z' becomes '8 Oct 2026'.
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}