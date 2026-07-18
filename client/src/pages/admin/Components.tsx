import { useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import AdminPageShell from '../../components/admin/AdminPageShell';
import ComponentsTable from '../../components/admin/ComponentsTable';
import ComponentForm from '../../components/admin/ComponentForm';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import useComponents from '../../hooks/useComponents';
import type { ComponentFormData, Toast } from '../../types/component';

// ── Constants ────────────────────────────────────────────────────────

const CATEGORIES = [
  '', 'CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'HDD',
  'PSU', 'Cabinet', 'Cooler', 'Monitor', 'Keyboard', 'Mouse',
] as const;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priceLowToHigh', label: 'Price: Low → High' },
  { value: 'priceHighToLow', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
] as const;

// ── Toast icon helper ────────────────────────────────────────────────

function ToastIcon({ type }: { type: Toast['type'] }) {
  switch (type) {
    case 'success':
      return <HiOutlineCheckCircle className="h-5 w-5 text-emerald-400" />;
    case 'error':
      return <HiOutlineExclamationCircle className="h-5 w-5 text-rose-400" />;
    default:
      return <HiOutlineInformationCircle className="h-5 w-5 text-sky-400" />;
  }
}

// ── Page Component ───────────────────────────────────────────────────

export default function Components() {
  const {
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
  } = useComponents();

  const [showForm, setShowForm] = useState(false);

  // ── Form handlers ───────────────────────────────────────────────

  const handleAdd = () => {
    setEditingComponent(null);
    setShowForm(true);
  };

  const handleEdit = (component: (typeof components)[number]) => {
    setEditingComponent(component);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingComponent(null);
  };

  const handleSubmit = async (data: ComponentFormData) => {
    if (editingComponent) {
      await editComponent(editingComponent._id, data);
    } else {
      await addComponent(data);
    }
    setShowForm(false);
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <AdminPageShell title="Components" description="Manage PC components and inventory.">
      <div className="space-y-6">
        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side: title + count */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Components
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isLoading
                ? 'Loading…'
                : `${components.length} component${components.length !== 1 ? 's' : ''} on this page`}
            </p>
          </div>

          {/* Right side: add button */}
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Component
          </button>
        </div>

        {/* ── Filters bar ─────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components…"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <HiOutlineFunnel className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Form (add / edit) ────────────────────────────────── */}
        {showForm && (
          <ComponentForm
            initialData={editingComponent}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        {/* ── Content area ────────────────────────────────────── */}
        {isLoading ? (
          <LoadingState message="Fetching components…" />
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center dark:border-rose-800 dark:bg-rose-950">
            <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-rose-400" />
            <p className="mt-4 text-lg font-semibold text-rose-700 dark:text-rose-300">
              Unable to load components
            </p>
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={fetchComponents}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              <HiOutlineArrowPath className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : components.length === 0 ? (
          <EmptyState
            title="No components found"
            description="Add a new component using the button above, or adjust your search filters."
          />
        ) : (
          <>
            <ComponentsTable
              components={components}
              onEdit={handleEdit}
              onDelete={removeComponent}
            />

            {/* ── Pagination ──────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      page === currentPage
                        ? 'bg-violet-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Toast notifications ─────────────────────────────────── */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {toasts.map((toast) => {
            const bgMap: Record<Toast['type'], string> = {
              success: 'bg-emerald-900 border-emerald-700',
              error: 'bg-rose-900 border-rose-700',
              info: 'bg-sky-900 border-sky-700',
            };

            return (
              <div
                key={toast.id}
                className={`flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-lg ${bgMap[toast.type]} animate-slideIn`}
              >
                <ToastIcon type={toast.type} />
                <p className="text-sm font-medium text-white">{toast.message}</p>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="ml-2 rounded-lg p-1 text-white/60 transition hover:text-white"
                >
                  <HiOutlineXMark className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
}
