import type { ComponentDetail } from '../../types/component';

interface ProductInfoProps {
  component: ComponentDetail;
}

const priceFormatter = (value: number, currency = 'INR') => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export default function ProductInfo({ component }: ProductInfoProps) {
  const sortedOffers = [...(component.prices ?? [])]
    .map((offer) => ({
      ...offer,
      store: offer.store ?? offer.storeName ?? 'Unknown store',
      price: offer.price ?? offer.currentPrice ?? 0,
      inStock: offer.inStock ?? (offer.availability ?? 'Available').toLowerCase() !== 'out of stock',
    }))
    .sort((a, b) => a.price - b.price);

  const cheapestOffer = sortedOffers[0];

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Overview</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">{component.name}</h2>
        <p className="mt-2 text-slate-600">{component.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Brand</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{component.brand}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Category</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{component.category}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Store</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Availability</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedOffers.map((offer) => {
                const isCheapest = cheapestOffer?.store === offer.store && cheapestOffer?.price === offer.price;
                return (
                  <tr key={`${offer.store}-${offer.productUrl}`} className={isCheapest ? 'bg-emerald-50/60' : ''}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {isCheapest && <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Cheapest</span>}
                      {offer.store}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{priceFormatter(offer.price, offer.currency ?? 'INR')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{offer.inStock ? 'In Stock' : 'Out of Stock'}</td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
