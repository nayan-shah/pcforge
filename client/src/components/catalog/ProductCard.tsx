import { Link } from 'react-router-dom';
import type { ComponentSummary } from '../../types/component';

interface ProductCardProps { component: ComponentSummary; }

const priceFormatter = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export default function ProductCard({ component }: ProductCardProps) {
  const lowestOffer = component.prices.reduce<ComponentSummary['prices'][number] | undefined>((lowest, offer) => {
    const offerPrice = offer.price ?? offer.currentPrice ?? Number.POSITIVE_INFINITY;
    const currentLowest = lowest ? (lowest.price ?? lowest.currentPrice ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
    return offerPrice < currentLowest ? offer : lowest;
  }, undefined);

  const offerCount = component.prices.filter((offer) => offer.productUrl).length;
  const lowestPrice = lowestOffer ? (lowestOffer.price ?? lowestOffer.currentPrice ?? 0) : 0;
  const lowestCurrency = lowestOffer?.currency ?? 'INR';

  return (
    <Link to={`/product/${component._id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-48 items-center justify-center bg-slate-100 p-4 dark:bg-slate-800">
        {component.images[0] ? <img src={component.images[0]} alt={component.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" /> : <span className="text-4xl" aria-label="No product image" role="img">📦</span>}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">{component.category}</p>
            <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{component.name}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{component.brand}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Lowest price</p>
            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{lowestOffer ? priceFormatter(lowestPrice, lowestCurrency) : 'Price unavailable'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Stores</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{offerCount}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
