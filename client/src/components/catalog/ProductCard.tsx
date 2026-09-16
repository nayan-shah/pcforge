import { Link } from 'react-router-dom';
import type { ComponentSummary } from '../../types/component';
import CategoryIcon from '../common/CategoryIcon';
import { formatPrice } from '../../utils/formatters';

interface ProductCardProps {
  component: ComponentSummary;
}

export default function ProductCard({ component }: ProductCardProps) {
  const lowestOffer = component.prices.reduce<ComponentSummary['prices'][number] | undefined>(
    (lowest, offer) => {
      const offerPrice = offer.price ?? offer.currentPrice ?? Number.POSITIVE_INFINITY;
      const currentLowest = lowest
        ? (lowest.price ?? lowest.currentPrice ?? Number.POSITIVE_INFINITY)
        : Number.POSITIVE_INFINITY;
      return offerPrice < currentLowest ? offer : lowest;
    },
    undefined,
  );

  const offerCount = component.prices.filter((offer) => offer.productUrl).length;
  const lowestPrice = lowestOffer ? (lowestOffer.price ?? lowestOffer.currentPrice ?? 0) : 0;
  const lowestCurrency = lowestOffer?.currency ?? 'INR';

  return (
    <Link
      to={`/components/${component._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-slate-900"
    >
      <div className="relative flex h-48 items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/50 p-4 border-b border-slate-100 overflow-hidden">
        {component.images && component.images[0] ? (
          <img
            src={component.images[0]}
            alt={component.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <CategoryIcon category={component.category} className="h-10 w-10 text-slate-300 mb-1" />
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
              {component.category}
            </span>
          </div>
        )}

        {offerCount > 0 && (
          <span className="absolute top-2.5 right-2.5 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 shadow-sm">
            {offerCount} store{offerCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-700">
              {component.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">{component.brand}</span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-bold text-slate-900 leading-snug group-hover:text-slate-950">
            {component.name}
          </h3>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Lowest live price</p>
            <p className="font-mono text-base font-extrabold text-slate-950">
              {lowestOffer ? formatPrice(lowestPrice, lowestCurrency) : 'Price unavailable'}
            </p>
          </div>
          <span className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-all duration-200 group-hover:bg-slate-800 group-hover:shadow-sm">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
