import { Link } from 'react-router-dom';
import type { ComponentSummary } from '../../types/component';

interface ProductCardProps { component: ComponentSummary; }

const priceFormatter = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export default function ProductCard({ component }: ProductCardProps) {
  const lowestOffer = component.prices.reduce<ComponentSummary['prices'][number] | undefined>((lowest, offer) => !lowest || offer.currentPrice < lowest.currentPrice ? offer : lowest, undefined);
  const stockClass = component.stockStatus === 'In Stock' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : component.stockStatus === 'Preorder' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';

  return (
    <Link to={`/product/${component._id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-48 items-center justify-center bg-slate-100 p-4 dark:bg-slate-800">
        {component.images[0] ? <img src={component.images[0]} alt={component.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" /> : <span className="text-4xl" aria-label="No product image" role="img">📦</span>}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">{component.category}</p><h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{component.name}</h2></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${stockClass}`}>{component.stockStatus}</span></div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{component.brand}</p>
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs text-slate-500">Starting at</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{lowestOffer ? priceFormatter(lowestOffer.currentPrice, lowestOffer.currency) : 'Price unavailable'}</p></div><span className="text-sm text-amber-500">★ {component.rating.toFixed(1)}</span></div>
      </div>
    </Link>
  );
}
