import type { ComponentSummary } from '../../types/component';

interface ProductCardProps {
  component: ComponentSummary;
  onSelect: (id: string) => void;
}

export default function ProductCard({ component, onSelect }: ProductCardProps) {
  const primaryPrice = component.prices?.[0]?.currentPrice ?? null;
  const currency = component.prices?.[0]?.currency ?? 'USD';

  return (
    <article
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onSelect(component._id)}
    >
      <div className="flex h-48 items-center justify-center bg-slate-100">
        <img
          src={component.images?.[0] ?? '/placeholder-image.svg'}
          alt={component.name}
          className="h-full max-h-48 w-auto object-contain"
        />
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {component.category}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{component.name}</h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              component.stockStatus === 'In Stock'
                ? 'bg-emerald-100 text-emerald-700'
                : component.stockStatus === 'Preorder'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {component.stockStatus}
          </span>
        </div>

        <p className="text-sm text-slate-600">{component.brand}</p>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Starting at</p>
            <p className="text-xl font-semibold text-slate-900">
              {primaryPrice !== null ? `${currency} ${primaryPrice.toFixed(2)}` : 'Price unavailable'}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {component.rating.toFixed(1)} ★
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {component.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
