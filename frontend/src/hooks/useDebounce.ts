import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapid values (e.g. search keystrokes)
 * Prevents flooding the backend server and database with queries.
 *
 * @param value The raw input value
 * @param delay Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
