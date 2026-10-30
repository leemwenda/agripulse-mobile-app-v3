import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ApiError } from './httpClient';

/** Loads data from the live API once the session is signed in. */
export function useRemoteData<T>(
  liveLoader: () => Promise<T>,
  deps: unknown[] = [],
) {
  const { mode } = useApp();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(mode === 'live');
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (mode !== 'live') return;

    setLoading(true);
    setError(null);
    liveLoader()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reloadTick, ...deps]);

  return { data, loading, error, reload };
}
