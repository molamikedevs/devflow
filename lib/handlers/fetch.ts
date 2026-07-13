import { ActionResponse } from '@/types/global';
import { RequestError } from '../http-errors';
import logger from '../logger';
import handleError from './error';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

// Type guard to safely narrow unknown catch values to Error
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export async function fetchHandler<T>(
  url: string,
  options: FetchOptions = {},
): Promise<ActionResponse<T>> {
  const { timeout = 5000, headers: customHeaders, ...restOptions } = options;

  // Aborts the request automatically if it exceeds the timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // Headers constructor correctly normalizes all three HeadersInit shapes
  // (Record, string[][], and Headers instances) — object spread silently
  // drops entries when customHeaders is a Headers instance
  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => headers.set(key, value));
  }

  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new RequestError(response.status, `Http error: ${response.status}`);
    }

    // 204/205 have no body — calling .json() on them throws
    if (response.status === 204 || response.status === 205) {
      return { success: true } as ActionResponse<T>;
    }

    return (await response.json()) as ActionResponse<T>;
  } catch (err) {
    const error = isError(err) ? err : new Error('Unknown error');

    if (error.name === 'AbortError') {
      logger.warn(`Request to ${url} time out`);
    } else {
      logger.error(`Error fetching ${url}: ${error.message}`);
    }
    return handleError(error) as ActionResponse<T>;
  } finally {
    clearTimeout(id);
  }
}
