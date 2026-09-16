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
    <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus-within:border-slate-400 focus-within:shadow-soft focus-within:ring-2 focus-within:ring-slate-900/5">
      <label htmlFor="component-search" className="sr-only">
        Search components
      </label>
      <input
        id="component-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>

  );
}
