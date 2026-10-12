import { tokenStore } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_URL as string;

// The API client throws ApiError for any failure, including network errors and non-2xx responses.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Convert any error into a user-friendly message. ApiError messages come from the server; other errors are unexpected.
export function getErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}

// The API client can call this if it gets a 401 while holding a token. 
// The app can then sign the user out automatically.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

// The API client wraps fetch() to handle JSON, errors, and auth tokens.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = tokenStore.get();

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // fetch only throws when the request never reached the server at all.
    throw new ApiError('Cannot reach the server. Please check your connection and try again.', 0);
  }

  // If the server responded with JSON, parse it. If not, data will be null.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // A 401 while holding a token means it expired or was revoked.
    if (response.status === 401 && token && onUnauthorized) {
      onUnauthorized();
    }
    throw new ApiError(data?.message ?? 'Something went wrong.', response.status);
  }

  return data as T;
}