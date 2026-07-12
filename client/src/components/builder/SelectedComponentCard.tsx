import type { SelectedComponent } from '../../types/builder';

interface SelectedComponentCardProps {
  component: SelectedComponent;
}

export default function SelectedComponentCard({ component }: SelectedComponentCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{component.category}</p>
        {component.option ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Selected
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Missing
          </span>
        )}
      </div>

      {component.option ? (
        <div className="mt-4 space-y-3">
          <p className="text-lg font-semibold text-slate-900">{component.option.name}</p>
          <p className="text-sm text-slate-500">{component.option.brand}</p>
          <div className="grid gap-2 text-sm text-slate-600">
            <p>Price: ${component.option.price.toFixed(2)}</p>
            <p>Power: {component.option.powerWatts}W</p>
          </div>
          <p className="text-sm text-slate-500">{component.option.description}</p>
        </div>
      ) : (
        <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
          No {component.category} selected yet.
        </div>
      )}
    </div>
  );
}
