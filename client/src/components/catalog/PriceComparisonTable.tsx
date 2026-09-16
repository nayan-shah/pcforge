import { HiOutlineBuildingStorefront, HiOutlineSparkles } from 'react-icons/hi2';
import type { ComponentPriceComparisonResponse, PriceOffer } from '../../types/component';
import PriceOfferRow from './PriceOfferRow';
import { formatPrice } from '../../utils/formatters';

interface PriceComparisonTableProps {
  comparison: ComponentPriceComparisonResponse | null;
}

export default function PriceComparisonTable({ comparison }: PriceComparisonTableProps) {
  const offers = [...(comparison?.prices ?? [])].sort(
    (a, b) =>
      (a.price ?? a.currentPrice ?? Infinity) - (b.price ?? b.currentPrice ?? Infinity),
  );

  if (!comparison || offers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-slate-600">
        <HiOutlineBuildingStorefront className="mx-auto h-8 w-8 text-slate-400 mb-2" />
        <p className="text-base font-semibold text-slate-900">
          No retailer offers are available right now.
        </p>
        <p className="mt-1 text-xs text-slate-500">Check back soon for fresh price comparisons.</p>
      </div>
    );
  }

  const cheapestOffer = offers.find((offer) => (offer.inStock ?? true) && (offer.price ?? offer.currentPrice ?? 0) > 0) ?? offers[0];
  const cheapestPrice = cheapestOffer ? (cheapestOffer.price ?? cheapestOffer.currentPrice ?? 0) : 0;
  const highestPrice = Math.max(...offers.map((o) => o.price ?? o.currentPrice ?? 0));
  const maxSavings = highestPrice > cheapestPrice && cheapestPrice > 0 ? highestPrice - cheapestPrice : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Multi-Store Comparison
            </span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-slate-950">
            Retailer Price Directory
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Comparing prices across {offers.length} verified Indian retailers
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cheapest: {cheapestOffer ? formatPrice(cheapestPrice, cheapestOffer.currency ?? 'INR') : '—'}</span>
          </div>
          {cheapestOffer && (
            <span className="text-[11px] font-semibold text-slate-500">
              Sold by: <span className="text-slate-800 font-bold">{cheapestOffer.storeName || cheapestOffer.store}</span>
            </span>
          )}
        </div>
      </div>

      {/* Savings highlight note */}
      {maxSavings > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/60 px-3.5 py-2.5 text-xs text-emerald-900">
          <HiOutlineSparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            You can save up to{' '}
            <strong className="font-mono font-bold text-emerald-950">
              {formatPrice(maxSavings, cheapestOffer?.currency ?? 'INR')}
            </strong>{' '}
            by buying from <strong className="font-bold">{cheapestOffer?.storeName || cheapestOffer?.store}</strong> instead of the highest priced site.
          </span>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/60">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Store / Retailer
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Price
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Stock Status
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Direct Store
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {offers.map((offer: PriceOffer, index: number) => {
                const isCheapest =
                  index === 0 ||
                  ((cheapestOffer?.storeName === offer.storeName || cheapestOffer?.store === offer.store) &&
                    cheapestOffer?.price === offer.price);

                return (
                  <PriceOfferRow
                    key={`${offer.storeName || offer.store}-${offer.productUrl}-${index}`}
                    offer={offer}
                    isCheapestAvailable={Boolean(isCheapest)}
                    cheapestPrice={cheapestPrice}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
