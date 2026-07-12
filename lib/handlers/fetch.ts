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

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Custom headers override the defaults
  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };

  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(id);
    if (!response.ok) {
      throw new RequestError(response.status, `Http error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    // Normalizes non-Error throws into an Error instance
    const error = isError(err) ? err : new Error('Unknown error');

    // Aborts (timeouts) are logged as warnings; everything else as errors
    if (error.name === 'AbortError') {
      logger.warn(`Request to ${url} time out`);
    } else {
      logger.error(`Error fetching ${url}: ${error.message}`);
    }
    return handleError(error) as unknown as ActionResponse<T>;
  }
}
