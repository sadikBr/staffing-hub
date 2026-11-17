import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Filters and paging kept in the URL query string, so that any view can be bookmarked, shared, and survives a reload.
 * Empty values are removed from the URL. Changing any filter resets the page to the first one.
 */
export function useUrlState<K extends string>(keys: readonly K[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = Object.fromEntries(keys.map((key) => [key, searchParams.get(key) ?? ''])) as Record<K, string>;
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0);

  const set = useCallback(
    (changes: Partial<Record<K | 'page', string | number | null | undefined>>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          let filterChanged = false;
          for (const [key, value] of Object.entries(changes)) {
            if (key !== 'page') filterChanged = true;
            if (value === null || value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
          }
          if (filterChanged && !('page' in changes)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clear = useCallback(() => setSearchParams(new URLSearchParams(), { replace: true }), [setSearchParams]);
  const activeCount = keys.filter((key) => values[key] !== '').length;

  return { values, page, set, clear, activeCount };
}

/** '' becomes undefined, so that unset filters are not sent to the API. */
export function orUndefined<T extends string>(value: string): T | undefined {
  return value === '' ? undefined : (value as T);
}
