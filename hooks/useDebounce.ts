import { SEARCH_DEBOUNCE_MS } from '@/constants';
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = SEARCH_DEBOUNCE_MS) {
  const [debounceValue, setDebounceValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounceValue;
}
