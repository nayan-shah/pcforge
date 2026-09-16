import type { ComponentDetail } from '../../types/component';

interface SpecificationsTableProps {
  component: ComponentDetail;
}

export default function SpecificationsTable({ component }: SpecificationsTableProps) {
  const specificationEntries = Object.entries(component.specifications || {});

  if (specificationEntries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 text-slate-500 shadow-card text-sm">
        No specifications available for this product.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Specifications</h3>
      </div>
      <div className="divide-y divide-slate-100 px-6">
        {specificationEntries.map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium text-slate-600">{key}</span>
            <span className="text-sm font-semibold text-slate-900">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
