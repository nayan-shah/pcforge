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
    <aside className="h-fit space-y-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-card lg:sticky lg:top-24">
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
            className="font-mono text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors underline"
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
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
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
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
          />
        </div>
      </div>
    </aside>
  );

}
