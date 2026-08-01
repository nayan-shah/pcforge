import { useEffect, useState } from 'react';
import { getComponents } from '../api/componentApi';
import type { ComponentQueryParams, ComponentsResponse } from '../types/component';

/** Fetches catalog results and cancels stale responses when filter state changes. */
export default function useCatalogComponents(params: ComponentQueryParams) {
  const [data, setData] = useState<ComponentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    getComponents(params)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setData(null);
          setError(requestError instanceof Error ? requestError.message : 'Unable to load components.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.search, params.category, params.brand, params.sort, params.page, params.limit, retryKey]);

  return { data, isLoading, error, retry: () => setRetryKey((value) => value + 1) };
}
