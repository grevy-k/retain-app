import { useEffect, useState } from 'react';
import { apiRequest, getErrorMessage } from '../api/client';

interface Result<T> {
  key: string; // A unique key for this request, used to determine if the result is still current.
  data?: T;
  error?: string;
}

// A hook that fetches data from the API and returns the result, loading state and error message.
export function useApi<T>(path: string) {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Changing the path or bumping reloadCount makes a new key, which triggers a fetch.
  const requestKey = `${path}#${reloadCount}`;

  useEffect(() => {
    let cancelled = false; // ignore answers from requests that are no longer current

    apiRequest<T>(path)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: requestKey, error: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [path, requestKey]);

  const isLoading = result?.key !== requestKey;
  const data = result?.data ?? null;
  const error = result?.key === requestKey ? result.error ?? null : null;

  return { data, isLoading, error, reload: () => setReloadCount((count) => count + 1) };
}