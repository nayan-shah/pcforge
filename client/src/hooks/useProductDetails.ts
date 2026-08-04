import { useEffect, useState } from 'react';
import { getComponentById, getComponentPrices, getRelatedComponents } from '../api/componentApi';
import type { ComponentDetail, ComponentPriceComparisonResponse } from '../types/component';

/**
 * Fetches a product detail response and its related products for a single component ID.
 *
 * This hook keeps the page component focused on layout and composition while the data
 * lifecycle remains centralized here for reuse and testability.
 */
export default function useProductDetails(productId: string) {
  const [data, setData] = useState<ComponentDetail | null>(null);
  const [comparison, setComparison] = useState<ComponentPriceComparisonResponse | null>(null);
  const [related, setRelated] = useState<ComponentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!productId) {
      setData(null);
      setComparison(null);
      setRelated([]);
      setError('A valid product ID is required.');
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError(null);

    Promise.all([
      getComponentById(productId),
      getComponentPrices(productId),
      getRelatedComponents(productId),
    ])
      .then(([component, prices, relatedProducts]) => {
        if (!active) return;
        setData(component);
        setComparison(prices);
        setRelated(relatedProducts);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setData(null);
        setComparison(null);
        setRelated([]);
        setError(requestError instanceof Error ? requestError.message : 'Unable to load product details.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  return { data, comparison, related, isLoading, error };
}
