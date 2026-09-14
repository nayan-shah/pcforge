interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search components...',
}: SearchBarProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs transition focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900/10">
      <label htmlFor="component-search" className="sr-only">
        Search components
      </label>
      <input
        id="component-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>

  );
}
