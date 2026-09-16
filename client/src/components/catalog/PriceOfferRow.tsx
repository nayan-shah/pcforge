import type { PriceOffer } from '../../types/component';

interface PriceOfferRowProps {
  offer: PriceOffer;
  isCheapestAvailable: boolean;
}

import { formatPrice, formatDate } from '../../utils/formatters';

export default function PriceOfferRow({ offer, isCheapestAvailable }: PriceOfferRowProps) {
  const availability = (offer.inStock ?? true) ? 'In Stock' : 'Out of Stock';

  return (
    <tr className={`transition-colors ${isCheapestAvailable ? 'bg-emerald-50/60' : 'hover:bg-slate-50/80'}`}>
      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
        {offer.storeName}
        {isCheapestAvailable && (
          <span className="ml-2 inline-flex rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
            Best
          </span>
        )}
      </td>
      <td className={`px-4 py-3.5 text-sm font-bold tabular-nums ${isCheapestAvailable ? 'text-emerald-700' : 'text-slate-900'}`}>
        {formatPrice(offer.price ?? 0, offer.currency ?? 'INR')}
      </td>
      <td className={`px-4 py-3.5 text-sm ${(offer.inStock ?? true) ? 'text-emerald-600 font-medium' : 'text-rose-500'}`}>
        {availability}
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-500">
        {formatDate(offer.lastUpdated) === '—' ? 'Recently updated' : formatDate(offer.lastUpdated)}
      </td>
      <td className="px-4 py-3.5">
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 active:scale-95 ${
            isCheapestAvailable
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-200'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          Buy Now
        </a>
      </td>
    </tr>
  );
}
