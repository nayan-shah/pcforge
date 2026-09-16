interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

import { SORT_OPTIONS } from '../../constants/sort';

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-sm transition-all duration-200 focus-within:border-slate-400 focus-within:shadow-soft">
      <label htmlFor="sort-dropdown" className="sr-only">
        Sort components
      </label>
      <select
        id="sort-dropdown"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm text-slate-900 outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
