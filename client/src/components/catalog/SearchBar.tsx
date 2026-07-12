interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search components...' }: SearchBarProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-slate-400">
      <label htmlFor="component-search" className="sr-only">
        Search components
      </label>
      <input
        id="component-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
