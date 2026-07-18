import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import DataTable from '../common/DataTable';
import type { ComponentDetail } from '../../types/component';

/**
 * Admin components data table.
 *
 * Purely presentational — all data and callbacks come from props.
 * Re-uses the generic DataTable component for consistent styling,
 * and adds thumbnail previews + Edit / Delete action buttons.
 */

interface ComponentsTableProps {
  components: ComponentDetail[];
  onEdit: (component: ComponentDetail) => void;
  onDelete: (id: string) => void;
}

export default function ComponentsTable({ components, onEdit, onDelete }: ComponentsTableProps) {
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      onDelete(id);
    }
  };

  const columns = [
    {
      header: 'Component',
      accessor: (item: ComponentDetail) => (
        <div className="flex items-center gap-3">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="h-10 w-10 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-400 dark:bg-slate-800">
              📦
            </div>
          )}
          <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
        </div>
      ),
    },
    {
      header: 'Brand',
      accessor: (item: ComponentDetail) => item.brand,
    },
    {
      header: 'Category',
      accessor: (item: ComponentDetail) => (
        <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          {item.category}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: (item: ComponentDetail) => {
        const price = item.prices?.[0];
        return price
          ? `${price.currency} ${price.currentPrice.toLocaleString()}`
          : '—';
      },
    },
    {
      header: 'Stock',
      accessor: (item: ComponentDetail) => {
        const statusColors: Record<string, string> = {
          'In Stock': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          'Out of Stock': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
          Preorder: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        };
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[item.stockStatus] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {item.stockStatus}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (item: ComponentDetail) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <HiOutlinePencilSquare className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => handleDelete(item._id, item.name)}
            className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
          >
            <HiOutlineTrash className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={components}
      rowKey={(item) => item._id}
      emptyState={
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No components found</p>
          <p className="text-sm text-slate-500">
            Add a new component using the button above, or adjust your search filters.
          </p>
        </div>
      }
    />
  );
}
