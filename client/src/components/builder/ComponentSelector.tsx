import type { BuilderOption, ComponentCategory } from '../../types/builder';

interface ComponentSelectorProps {
  category: ComponentCategory;
  options: BuilderOption[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (option: BuilderOption) => void;
}

export default function ComponentSelector({ category, options, selectedId, loading, onSelect }: ComponentSelectorProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Loading component options...
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500 shadow-sm">
        No {category} options are available right now.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Select {category}</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Choose the best option for your build</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              className={`group flex flex-col gap-4 rounded-3xl border p-5 text-left transition ${
                isSelected
                  ? 'border-violet-500 bg-violet-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{option.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{option.brand}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  {option.category}
                </span>
              </div>

              <div className="grid gap-2 text-slate-600">
                <p>{option.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                  <span>Price: ${option.price.toFixed(2)}</span>
                  <span>Power: {option.powerWatts}W</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
