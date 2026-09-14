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
    <aside className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            CATALOG FILTER
          </span>
          <h2 className="text-sm font-extrabold text-slate-950">Refine Parts</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="font-mono text-xs font-semibold text-slate-500 hover:text-slate-950 transition underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="category-filter"
            className="mb-1.5 block text-xs font-bold text-slate-700"
          >
            Component Category
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10"
          >
            {categories.map((item) => (
              <option key={item} value={item === 'All' ? '' : item}>
                {item === 'All' ? 'All Categories' : item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="brand-filter" className="mb-1.5 block text-xs font-bold text-slate-700">
            Manufacturer / Brand
          </label>
          <input
            id="brand-filter"
            value={brand}
            onChange={(event) => onBrandChange(event.target.value)}
            placeholder="e.g. AMD, Corsair, ASUS..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10"
          />
        </div>
      </div>
    </aside>
  );

}
