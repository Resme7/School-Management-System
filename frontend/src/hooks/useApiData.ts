import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';

interface Result<T> {
  key: string;
  data: T | null;
  error: string | null;
}

export function useApiData<T>(url: string | null) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const key = `${url}#${version}`;

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    api
      .get<T>(url)
      .then((response) => {
        if (!cancelled) setResult({ key, data: response.data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setResult({ key, data: null, error: getErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [url, key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: url ? (result?.data ?? null) : null,
    error: url ? (result?.error ?? null) : null,
    loading: url !== null && result?.key !== key,
    reload,
  };
}