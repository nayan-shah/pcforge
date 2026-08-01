interface ProductFiltersProps {
  category: string;
  brand: string;
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
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
}: ProductFiltersProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        <p className="mt-2 text-sm text-slate-600">Refine the catalog by component category or brand.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="category-filter" className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
}
