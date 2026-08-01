interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'priceLowToHigh', label: 'Price: Low to High' },
  { value: 'priceHighToLow', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <label htmlFor="sort-dropdown" className="sr-only">
        Sort components
      </label>
      <select
        id="sort-dropdown"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-slate-900 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
