import type { ComponentDetail } from '../../types/component';

interface ProductInfoProps {
  component: ComponentDetail;
}

export default function ProductInfo({ component }: ProductInfoProps) {
  const primaryOffer = component.prices?.[0];

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Overview</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">{component.name}</h2>
        <p className="mt-2 text-slate-600">{component.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Brand</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{component.brand}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Category</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{component.category}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Price</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {primaryOffer ? `${primaryOffer.currency} ${primaryOffer.currentPrice.toFixed(2)}` : 'Price unavailable'}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Availability</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {primaryOffer?.availability ?? 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}
