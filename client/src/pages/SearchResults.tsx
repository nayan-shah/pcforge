import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  HiOutlineArrowPath,
  HiOutlineExclamationCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiArrowTopRightOnSquare,
} from 'react-icons/hi2';
import useRetailerSearch from '../hooks/useRetailerSearch';
import type { RetailerOffer } from '../types/component';

const formatPrice = (price: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
};

const isAvailable = (availability: string) =>
  !/out of stock|unavailable|sold out/i.test(availability);

/* -- Retailer logo colours --------------------------------------- */
const STORE_COLORS: Record<string, string> = {
  MDComputers: 'from-blue-600 to-blue-700',
  PrimeABGB:   'from-orange-500 to-orange-600',
  Vedant:      'from-emerald-600 to-emerald-700',
  Amazon:      'from-yellow-500 to-orange-500',
};

function StoreBadge({ name }: { name: string }) {
  const gradient = STORE_COLORS[name] ?? 'from-slate-500 to-slate-600';
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gradient-to-r ${gradient} px-2.5 py-1 text-xs font-bold text-white shadow-sm`}
    >
      {name}
    </span>
  );
}

/* -- Individual offer card --------------------------------------- */
function OfferCard({ offer, isCheapest, rank }: { offer: RetailerOffer; isCheapest: boolean; rank: number }) {
  const available = isAvailable(offer.availability);
  return (
    <div
      className={`group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center ${
        isCheapest
          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm shadow-emerald-100'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Rank badge */}
      <div className={`absolute -left-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow ${
        isCheapest ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
      }`}>
        {rank}
      </div>

      {/* Product image */}
      <div className="flex-shrink-0">
        {offer.image ? (
          <img
            src={offer.image}
            alt={offer.productName}
            className="h-20 w-20 rounded-xl border border-slate-100 object-contain p-1"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-300">
            <HiOutlineShoppingCart className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StoreBadge name={offer.storeName} />
          {isCheapest && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
              ? Cheapest
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-medium text-slate-800 leading-snug">
          {offer.productName}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            {available ? (
              <HiOutlineCheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <HiOutlineXCircle className="h-3.5 w-3.5 text-rose-500" />
            )}
            {offer.availability || 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <HiOutlineClock className="h-3.5 w-3.5" />
            {formatDate(offer.lastUpdated)}
          </span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex flex-col items-end gap-3 sm:min-w-[160px]">
        <p className={`text-2xl font-bold tabular-nums ${isCheapest ? 'text-emerald-700' : 'text-slate-900'}`}>
          {formatPrice(offer.price, offer.currency)}
        </p>
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 ${
            isCheapest
              ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow shadow-emerald-200'
              : 'bg-slate-900 text-white hover:bg-slate-700'
          }`}
        >
          Buy Now
          <HiArrowTopRightOnSquare className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

/* -- Loading skeleton -------------------------------------------- */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded-full bg-slate-200" />
            <div className="h-3 w-3/4 rounded-full bg-slate-100" />
            <div className="h-3 w-1/2 rounded-full bg-slate-100" />
          </div>
          <div className="space-y-2 text-right">
            <div className="ml-auto h-7 w-28 rounded-full bg-slate-200" />
            <div className="ml-auto h-8 w-24 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -- Retailer status pills (shown while loading) ------------------ */
const RETAILERS = ['MDComputers', 'PrimeABGB', 'Vedant'];

function ScrapingStatus() {
  return (
    <div className="flex flex-wrap gap-2">
      {RETAILERS.map((name) => (
        <span
          key={name}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          Scraping {name}…
        </span>
      ))}
    </div>
  );
}

/* -- Main page --------------------------------------------------- */
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(queryParam);
  const { data, isLoading, error, retry } = useRetailerSearch(queryParam);

  // Keep input in sync when URL changes (e.g. back/forward)
  useEffect(() => { setInputValue(queryParam); }, [queryParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed }, { replace: false });
  };

  const cheapestOffer = data?.cheapestOffer ?? null;

  return (
    <section className="space-y-8">
      {/* -- Hero search bar -- */}
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">
          Live Price Comparison
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Find the Best Price
        </h1>
        <p className="mt-1.5 text-slate-500 text-sm">
          Real-time prices scraped from MDComputers, PrimeABGB, and Vedant.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex gap-3">
          <div className="relative flex flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/10 transition">
            <HiOutlineMagnifyingGlass className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400" />
            <input
              id="search-results-input"
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. RTX 5070, Ryzen 9 9950X, DDR5 32GB…"
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            {isLoading ? (
              <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
            ) : (
              <HiOutlineMagnifyingGlass className="h-4 w-4" />
            )}
            Search
          </button>
        </form>
      </header>

      {/* -- No query yet -- */}
      {!queryParam && !isLoading && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center">
          <HiOutlineMagnifyingGlass className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">Search for any PC component</h2>
          <p className="mt-2 text-sm text-slate-500">
            Type a product name above and hit Search to compare live prices across retailers.
          </p>
        </div>
      )}

      {/* -- Loading state -- */}
      {isLoading && (
        <div className="space-y-6">
          <ScrapingStatus />
          <LoadingSkeleton />
        </div>
      )}

      {/* -- Error state -- */}
      {!isLoading && error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center">
          <HiOutlineExclamationCircle className="mx-auto h-11 w-11 text-rose-400" />
          <h2 className="mt-4 text-lg font-semibold text-rose-800">Could not fetch prices</h2>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            <HiOutlineArrowPath className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* -- Results -- */}
      {!isLoading && !error && data && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {data.totalOffers} offer{data.totalOffers !== 1 ? 's' : ''} across{' '}
                {data.totalStores} store{data.totalStores !== 1 ? 's' : ''} for{' '}
                <span className="text-violet-600">&ldquo;{data.query}&rdquo;</span>
              </p>
            </div>
            {cheapestOffer && (
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
                <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Best price:{' '}
                  <span className="font-extrabold">
                    {formatPrice(cheapestOffer.price, cheapestOffer.currency)}
                  </span>
                  {' '}at {cheapestOffer.storeName}
                </span>
              </div>
            )}
          </div>

          {/* No results */}
          {data.offers.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-14 text-center">
              <HiOutlineMagnifyingGlass className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-4 text-lg font-semibold text-slate-700">No results found</h2>
              <p className="mt-2 text-sm text-slate-500">
                Try a broader search term, e.g. just the model number.
              </p>
            </div>
          )}

          {/* Offer cards */}
          <div className="space-y-4">
            {data.offers.map((offer, index) => (
              <OfferCard
                key={`${offer.storeName}-${offer.productUrl}-${index}`}
                offer={offer}
                isCheapest={
                  cheapestOffer?.storeName === offer.storeName &&
                  cheapestOffer?.productUrl === offer.productUrl
                }
                rank={index + 1}
              />
            ))}
          </div>

          {/* Browse catalog link */}
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center">
            <p className="text-sm text-slate-700">
              Looking to browse all components?{' '}
              <Link
                to="/components"
                className="font-semibold text-violet-600 underline-offset-2 hover:underline"
              >
                Open the catalog ?
              </Link>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
