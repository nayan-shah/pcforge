import type { ComponentDetail } from '../../types/component';

interface SpecificationsTableProps {
  component: ComponentDetail;
}

export default function SpecificationsTable({ component }: SpecificationsTableProps) {
  const specificationEntries = Object.entries(component.specifications || {});

  if (specificationEntries.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        No specifications available for this product.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-50 px-6 py-5">
        <h3 className="text-lg font-semibold text-slate-900">Specifications</h3>
      </div>
      <div className="divide-y divide-slate-200 px-6 py-5">
        {specificationEntries.map(([key, value]) => (
          <div key={key} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-slate-700">{key}</span>
            <span className="text-slate-600">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
