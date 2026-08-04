import type { ComponentPriceComparisonResponse, PriceOffer } from '../../types/component';
import PriceOfferRow from './PriceOfferRow';

interface PriceComparisonTableProps {
  comparison: ComponentPriceComparisonResponse | null;
}

const formatPrice = (value: number, currency = 'INR') =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export default function PriceComparisonTable({ comparison }: PriceComparisonTableProps) {
  const offers = [...(comparison?.prices ?? [])]
    .sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));

  if (!comparison || offers.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
        <p className="text-lg font-semibold text-slate-900">No retailer offers are available right now.</p>
        <p className="mt-2 text-sm">Check back soon for fresh price comparisons.</p>
      </div>
    );
  }

  const cheapestOffer = offers.find((offer) => offer.inStock ?? true) ?? offers[0];

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Comparison</p>
          <p className="mt-1 text-sm text-slate-600">{comparison.storeCount} stores offering this component</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Cheapest available: {cheapestOffer ? formatPrice(cheapestOffer.price ?? 0, cheapestOffer.currency ?? 'INR') : '—'}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Store</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Availability</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Last updated</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {offers.map((offer: PriceOffer) => {
                const isCheapest = cheapestOffer?.storeName === offer.storeName && cheapestOffer?.price === offer.price;
                return (
                  <PriceOfferRow
                    key={`${offer.storeName}-${offer.productUrl}`}
                    offer={offer}
                    isCheapestAvailable={Boolean(isCheapest)}
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
