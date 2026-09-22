import { Link } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiArrowTopRightOnSquare,
  HiOutlineShoppingCart,
  HiOutlineStar,
} from 'react-icons/hi2';
import type { CatalogSearchResult, RetailerPriceSummary } from '../../types/component';
import { STORE_COLORS, PRIMARY_RETAILERS } from '../../constants/retailers';
import { formatPrice } from '../../utils/formatters';

/**
 * CatalogSearchCard — shows a DB catalog component with an inline per-retailer
 * price comparison grid in search results.
 *
 * Design decisions:
 * - All 4 primary retailers are always shown (even if price is unavailable),
 *   so the grid is always a predictable 2×2 layout.
 * - The cheapest in-stock price gets a 🏆 Cheapest badge.
 * - Out-of-stock entries are visually greyed to communicate unavailability.
 * - Timestamps use a "X mins ago" relative format.
 * - Clicking the card header navigates to the component detail page.
 */

interface CatalogSearchCardProps {
  result: CatalogSearchResult;
}

/** Returns "X mins ago", "X hrs ago", or a date string. */
function relativeTime(isoString: string | undefined): string {
  if (!isoString) return '—';
  const deltaMs = Date.now() - new Date(isoString).getTime();
  if (Number.isNaN(deltaMs)) return '—';
  const mins = Math.floor(deltaMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'short' }).format(new Date(isoString));
}

function StoreBadge({ name }: { name: string }) {
  const gradient = STORE_COLORS[name] ?? 'from-slate-500 to-slate-600';
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gradient-to-r ${gradient} px-2 py-0.5 text-[10px] font-bold text-white`}
    >
      {name}
    </span>
  );
}

interface RetailerCellProps {
  storeName: string;
  offer: RetailerPriceSummary | undefined;
  isCheapest: boolean;
}

function RetailerCell({ storeName, offer, isCheapest }: RetailerCellProps) {
  const available = offer?.inStock ?? false;
  const hasPrice = offer?.price != null && offer.price > 0;

  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl border p-3 transition-all ${
        isCheapest && hasPrice && available
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
          : available && hasPrice
            ? 'border-slate-200 bg-white hover:border-slate-300'
            : 'border-slate-100 bg-slate-50/60 opacity-70'
      }`}
    >
      {/* Store badge + cheapest marker */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <StoreBadge name={storeName} />
        {isCheapest && hasPrice && available && (
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">
            🏆 Best
          </span>
        )}
      </div>

      {/* Price */}
      {hasPrice ? (
        <p
          className={`font-mono text-sm font-extrabold tabular-nums ${
            isCheapest && available ? 'text-emerald-700' : 'text-slate-800'
          }`}
        >
          {formatPrice(offer!.price!, offer?.currency ?? 'INR')}
        </p>
      ) : (
        <p className="text-xs font-medium text-slate-400 italic">Price unavailable</p>
      )}

      {/* Availability */}
      <div className="flex items-center gap-1">
        {available ? (
          <HiOutlineCheckCircle className="h-3 w-3 flex-shrink-0 text-emerald-500" />
        ) : (
          <HiOutlineXCircle className="h-3 w-3 flex-shrink-0 text-rose-400" />
        )}
        <span className={`text-[10px] font-medium ${available ? 'text-emerald-700' : 'text-rose-500'}`}>
          {offer?.availability ?? 'Unknown'}
        </span>
      </div>

      {/* Last updated */}
      <div className="flex items-center gap-1 text-[10px] text-slate-400">
        <HiOutlineClock className="h-2.5 w-2.5 flex-shrink-0" />
        {relativeTime(offer?.lastUpdated)}
      </div>

      {/* Buy link */}
      {offer?.productUrl && (
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
          className={`mt-0.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition active:scale-95 ${
            isCheapest && available
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-900 text-white hover:bg-slate-700'
          }`}
        >
          Buy
          <HiArrowTopRightOnSquare className="h-2.5 w-2.5" />
        </a>
      )}
    </div>
  );
}

export default function CatalogSearchCard({ result }: CatalogSearchCardProps) {
  // Determine the cheapest in-stock offer across all retailers
  const retailerEntries = PRIMARY_RETAILERS.map((name) => ({
    name,
    offer: result.prices[name] as RetailerPriceSummary | undefined,
  }));

  const cheapestEntry = retailerEntries.reduce<{ name: string; price: number } | null>(
    (best, { name, offer }) => {
      if (!offer || offer.price == null || offer.price <= 0 || !offer.inStock) return best;
      if (!best || offer.price < best.price) return { name, price: offer.price };
      return best;
    },
    null,
  );

  // Also count entries with valid prices
  const storeCount = retailerEntries.filter(({ offer }) => offer?.price != null && offer.price > 0).length;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      {/* ── Card header: image + meta + link ───────────────────── */}
      <Link
        to={`/components/${result._id}`}
        className="group flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-4 transition hover:bg-slate-50"
      >
        {/* Image */}
        <div className="flex-shrink-0">
          {result.images[0] ? (
            <img
              src={result.images[0]}
              alt={result.name}
              className="h-14 w-14 rounded-xl border border-slate-200 object-contain p-1"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-100 bg-slate-100 text-slate-300">
              <HiOutlineShoppingCart className="h-7 w-7" />
            </div>
          )}
        </div>

        {/* Name / brand / category */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-600">
              {result.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">{result.brand}</span>
            {result.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-amber-500 font-semibold">
                <HiOutlineStar className="h-3 w-3" />
                {result.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-slate-950">
            {result.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Prices from {storeCount} store{storeCount !== 1 ? 's' : ''}
            {cheapestEntry && (
              <>
                {' · '}
                <span className="font-semibold text-emerald-700">
                  From {formatPrice(cheapestEntry.price)} at {cheapestEntry.name}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Chevron */}
        <span className="flex-shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white transition group-hover:bg-slate-700">
          View →
        </span>
      </Link>

      {/* ── Per-retailer price grid (2×2) ──────────────────────── */}
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {PRIMARY_RETAILERS.map((storeName) => (
          <RetailerCell
            key={storeName}
            storeName={storeName}
            offer={result.prices[storeName]}
            isCheapest={cheapestEntry?.name === storeName}
          />
        ))}
      </div>
    </article>
  );
}
