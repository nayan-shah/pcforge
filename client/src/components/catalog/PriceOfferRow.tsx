import type { PriceOffer } from '../../types/component';

interface PriceOfferRowProps {
  offer: PriceOffer;
  isCheapestAvailable: boolean;
}

import { formatPrice, formatDate } from '../../utils/formatters';

export default function PriceOfferRow({ offer, isCheapestAvailable }: PriceOfferRowProps) {
  const availability = (offer.inStock ?? true) ? 'In Stock' : 'Out of Stock';

  return (
    <tr className={isCheapestAvailable ? 'bg-emerald-50/70' : ''}>
      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
        {offer.storeName}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
        {formatPrice(offer.price ?? 0, offer.currency ?? 'INR')}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{availability}</td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {formatDate(offer.lastUpdated) === '—' ? 'Recently updated' : formatDate(offer.lastUpdated)}
      </td>
      <td className="px-4 py-3">
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          Buy Now
        </a>
      </td>
    </tr>
  );
}
