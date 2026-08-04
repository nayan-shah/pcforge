import type { PriceOffer } from '../../types/component';

interface PriceOfferRowProps {
  offer: PriceOffer;
  isCheapestAvailable: boolean;
}

const formatPrice = (value: number, currency = 'INR') =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return 'Recently updated';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently updated';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function PriceOfferRow({ offer, isCheapestAvailable }: PriceOfferRowProps) {
  const availability = offer.inStock ?? true ? 'In Stock' : 'Out of Stock';

  return (
    <tr className={isCheapestAvailable ? 'bg-emerald-50/70' : ''}>
      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
        {isCheapestAvailable && (
          <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Cheapest
          </span>
        )}
        {offer.storeName}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
        {formatPrice(offer.price ?? 0, offer.currency ?? 'INR')}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {availability}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {formatDate(offer.lastUpdated)}
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
