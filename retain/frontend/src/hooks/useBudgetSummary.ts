import { useEffect, useState } from 'react';
import { apiRequest, getErrorMessage } from '../api/client';
import type { BudgetSummary } from '../types';

interface Result {
  key: string; // The request key that produced this result. Used to ignore stale results.
  data?: BudgetSummary;
  error?: string;
}

// Fetch the budget summary for a given month. Returns the summary, a loading state, an error message, and a reload function.
export function useBudgetSummary(month: string) {
  const [result, setResult] = useState<Result | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // The request key is a combination of the month and the reload count. If either changes, we make a new request.
  const requestKey = `${month}#${reloadCount}`;

  useEffect(() => {
    let cancelled = false; // ignore answers from requests that are no longer current

    apiRequest<BudgetSummary>(`/budgets/${month}/summary`)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: requestKey, error: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [month, requestKey]);

  const isLoading = result?.key !== requestKey;
  const summary = result?.data ?? null;
  const error = result?.key === requestKey ? result.error ?? null : null;

  return { summary, isLoading, error, reload: () => setReloadCount((count) => count + 1) };
}