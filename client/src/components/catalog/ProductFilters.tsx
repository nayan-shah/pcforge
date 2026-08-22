interface ProductFiltersProps {
  category: string;
  brand: string;
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
  onClear: () => void;
}

const categories = [
  'All',
  'CPU',
  'GPU',
  'Motherboard',
  'RAM',
  'SSD',
  'HDD',
  'PSU',
  'Cabinet',
  'Cooler',
  'Monitor',
  'Keyboard',
  'Mouse',
];

export default function ProductFilters({
  category,
  brand,
  onCategoryChange,
  onBrandChange,
  onClear,
}: ProductFiltersProps) {
  const hasActiveFilters = Boolean(category || brand);

  return (
    <aside className="h-fit space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Narrow down your results.</p>
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={onClear} className="text-sm font-semibold text-violet-600 transition hover:text-violet-500">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="category-filter" className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-violet-900/40"
          >
            {categories.map((item) => (
              <option key={item} value={item === 'All' ? '' : item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="brand-filter" className="mb-2 block text-sm font-medium text-slate-700">
            Brand
          </label>
          <input
            id="brand-filter"
            value={brand}
            onChange={(event) => onBrandChange(event.target.value)}
            placeholder="e.g. AMD, Corsair"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-violet-900/40"
          />
        </div>
      </div>
    </aside>
  );
}
