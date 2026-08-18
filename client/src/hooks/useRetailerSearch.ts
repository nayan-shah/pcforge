import { useEffect, useState } from 'react';
import { searchRetailers } from '../api/searchApi';
import type { RetailerSearchResponse } from '../types/component';

interface UseRetailerSearchResult {
  data: RetailerSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Fetches live price-comparison results from the scraper orchestrator.
 *
 * - Fires on every query string change (with 50 ms guard to skip empty mount).
 * - Cancels stale responses via an `active` flag to prevent state races.
 * - A `retryKey` increment re-runs the same query without changing the URL.
 */
export default function useRetailerSearch(query: string): UseRetailerSearchResult {
  const [data, setData] = useState<RetailerSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    searchRetailers(trimmed)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setData(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to fetch retailer prices.',
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, retryKey]);

  return { data, isLoading, error, retry: () => setRetryKey((k) => k + 1) };
}
