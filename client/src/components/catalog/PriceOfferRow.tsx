import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import type { PriceOffer } from '../../types/component';
import { formatPrice, formatDate } from '../../utils/formatters';

interface PriceOfferRowProps {
  offer: PriceOffer;
  isCheapestAvailable: boolean;
  cheapestPrice?: number | null;
}

export default function PriceOfferRow({
  offer,
  isCheapestAvailable,
  cheapestPrice,
}: PriceOfferRowProps) {
  const isAvailable = offer.inStock;
  const availability =
    offer.availability ||
    (isAvailable === true ? 'In Stock' : isAvailable === false ? 'Out of Stock' : 'Unknown');
  const rawPrice = offer.price ?? offer.currentPrice;
  const offerPrice =
    rawPrice != null && Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : null;

  const priceDiff =
    cheapestPrice && offerPrice != null && offerPrice > cheapestPrice
      ? offerPrice - cheapestPrice
      : 0;
  return (
    <tr
      className={`transition-colors ${
        isCheapestAvailable ? 'bg-emerald-50/70 hover:bg-emerald-100/60' : 'hover:bg-slate-50/80'
      }`}
    >
      {/* Store Name & Best Badge */}
      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
        <div className="flex items-center gap-2">
          <span>{offer.storeName || offer.store}</span>
          {isCheapestAvailable && (
            <span className="inline-flex rounded-md bg-emerald-600 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-white shadow-xs">
              Lowest Price
            </span>
          )}
        </div>
      </td>

      {/* Price & Difference vs Lowest */}
      <td className="px-4 py-3.5 text-sm font-bold tabular-nums">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span
            className={
              isCheapestAvailable ? 'text-emerald-700 font-extrabold' : 'text-slate-950 font-bold'
            }
          >
            {offerPrice != null ? formatPrice(offerPrice, offer.currency ?? 'INR') : 'Price N/A'}
          </span>
          {priceDiff > 0 && (
            <span className="inline-flex items-center text-[11px] font-medium text-slate-500 font-mono">
              (+{formatPrice(priceDiff, offer.currency ?? 'INR')})
            </span>
          )}
        </div>
      </td>

      {/* Stock Availability */}
      <td className="px-4 py-3.5 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isAvailable === true
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : isAvailable === false
                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                : 'bg-slate-50 text-slate-600 border border-slate-200/60'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isAvailable === true
                ? 'bg-emerald-500'
                : isAvailable === false
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
            }`}
          />
          {availability}
        </span>
      </td>

      {/* Last Updated */}
      <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
        {formatDate(offer.lastUpdated ?? undefined)}
      </td>

      {/* Action / Buy Now */}
      <td className="px-4 py-3.5">
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 active:scale-95 shadow-xs ${
            isCheapestAvailable
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <span>{offerPrice == null ? 'Check on store' : 'Buy Now'}</span>
          <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
        </a>
      </td>
    </tr>
  );
}
