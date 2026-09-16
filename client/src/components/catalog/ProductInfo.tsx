import type { ComponentDetail } from '../../types/component';

interface ProductInfoProps {
  component: ComponentDetail;
}

export default function ProductInfo({ component }: ProductInfoProps) {
  return (
    <div className="space-y-5 rounded-xl border border-slate-200/80 bg-white p-6 shadow-card">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Overview</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{component.name}</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{component.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 border border-slate-100">
          <p className="text-xs font-medium text-slate-500">Brand</p>
          <p className="mt-1 text-base font-bold text-slate-900">{component.brand}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 border border-slate-100">
          <p className="text-xs font-medium text-slate-500">Category</p>
          <p className="mt-1 text-base font-bold text-slate-900">{component.category}</p>
        </div>
      </div>
    </div>
  );
}
