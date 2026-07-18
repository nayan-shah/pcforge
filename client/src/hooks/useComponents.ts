import { useCallback, useEffect, useRef, useState } from 'react';
import * as componentApi from '../api/componentApi';
import type {
  ComponentDetail,
  ComponentFormData,
  Toast,
} from '../types/component';

/**
 * useComponents — custom hook that owns all CRUD state for the admin
 * components page. Returns everything the UI needs: data, filters,
 * pagination, loading/error states, action handlers, and toasts.
 *
 * Design decisions
 * ────────────────
 * • Server-side filtering — search / category / sort params are forwarded
 *   to the backend so pagination totals remain accurate.
 * • Debounced search — a 400 ms delay prevents excessive API calls while
 *   the user is still typing.
 * • Auto-fetch — a single useEffect watches the filter + page state and
 *   re-fetches whenever any value changes.
 * • Toast auto-dismiss — toasts are removed after 4 s to keep the UI tidy.
 */

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const TOAST_DURATION_MS = 4_000;

export default function useComponents() {
  // ── List state ───────────────────────────────────────────────────
  const [components, setComponents] = useState<ComponentDetail[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filter state ─────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  // ── Editing state ────────────────────────────────────────────────
  const [editingComponent, setEditingComponent] = useState<ComponentDetail | null>(null);

  // ── Toast state ──────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // ── Helpers ──────────────────────────────────────────────────────

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = String(++toastIdRef.current);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Debounced search ─────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on new search
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch components ─────────────────────────────────────────────

  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await componentApi.getComponents({
        search: debouncedSearch || undefined,
        category: category || undefined,
        sort,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      setComponents(result.components);
      setTotalPages(result.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load components.';
      setError(message);
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, category, sort, currentPage]);

  // Auto-fetch when filters or page change
  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // ── CRUD actions ─────────────────────────────────────────────────

  const addComponent = useCallback(
    async (data: ComponentFormData) => {
      try {
        await componentApi.createComponent(data);
        addToast('success', 'Component created successfully.');
        setCurrentPage(1);
        await fetchComponents();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create component.';
        addToast('error', message);
        throw err; // Re-throw so the form can react (e.g. keep submitting state)
      }
    },
    [addToast, fetchComponents],
  );

  const editComponent = useCallback(
    async (id: string, data: ComponentFormData) => {
      try {
        await componentApi.updateComponent(id, data);
        addToast('success', 'Component updated successfully.');
        setEditingComponent(null);
        await fetchComponents();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update component.';
        addToast('error', message);
        throw err;
      }
    },
    [addToast, fetchComponents],
  );

  const removeComponent = useCallback(
    async (id: string) => {
      try {
        await componentApi.deleteComponent(id);
        addToast('success', 'Component deleted successfully.');
        await fetchComponents();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete component.';
        addToast('error', message);
      }
    },
    [addToast, fetchComponents],
  );

  // ── Public API ───────────────────────────────────────────────────

  return {
    // Data
    components,
    totalPages,
    currentPage,
    isLoading,
    error,

    // Filters
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    setCurrentPage,

    // Editing
    editingComponent,
    setEditingComponent,

    // Actions
    addComponent,
    editComponent,
    removeComponent,
    fetchComponents,

    // Toasts
    toasts,
    dismissToast,
  };
}
