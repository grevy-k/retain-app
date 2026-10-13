import { useEffect, useState } from 'react';
import { apiRequest, getErrorMessage } from '../api/client';
import type { Expense, ExpenseListResponse, Pagination } from '../types';

interface Result {
  key: string; // which request this result belongs to
  data?: ExpenseListResponse;
  error?: string;
}

// Loads one page of expenses for a given query string and reloads whenever it changes.
// The previous results stay on screen while the next ones load, so the table doesn't flicker.
export function useExpenses(queryString: string) {
  const [result, setResult] = useState<Result | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // The request key changes whenever the query string or reload count changes, so we can tell if the result is for the latest request.
  const requestKey = `${queryString}#${reloadCount}`;

  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after a newer request started

    apiRequest<ExpenseListResponse>(`/expenses?${queryString}`)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: requestKey, error: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [queryString, requestKey]);

  // Loading = the newest answer we have is for an older request.
  const isLoading = result?.key !== requestKey;
  const expenses: Expense[] = result?.data?.expenses ?? [];
  const pagination: Pagination | null = result?.data?.pagination ?? null;
  const error = result?.key === requestKey ? result.error ?? null : null;

  return { expenses, pagination, isLoading, error, reload: () => setReloadCount((count) => count + 1) };
}