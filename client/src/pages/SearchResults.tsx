import { useState } from 'react';
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
  HiOutlineCpuChip,
} from 'react-icons/hi2';
import useRetailerSearch from '../hooks/useRetailerSearch';
import type { RetailerOffer, ComponentDetail } from '../types/component';
import ProductCard from '../components/catalog/ProductCard';

import { COMPONENT_BRANDS, getComponentBrand } from '../constants/brands';
import { STORE_COLORS } from '../constants/retailers';
import { formatPrice, formatDate } from '../utils/formatters';

const isAvailable = (availability?: string) =>
  !availability || !/out of stock|unavailable|sold out/i.test(availability);

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
function OfferCard({
  offer,
  isCheapest,
  rank,
}: {
  offer: RetailerOffer;
  isCheapest: boolean;
  rank: number;
}) {
  const available = isAvailable(offer.availability);
  return (
    <div
      className={`group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center ${
        isCheapest
          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm shadow-emerald-100'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >

      {/* Product image */}
      <div className="flex-shrink-0">
        {offer.image ? (
          <img
            src={offer.image}
            alt={offer.productName}
            className="h-20 w-20 rounded-xl border border-slate-100 object-contain p-1"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
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
              🏆 Cheapest
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
        <p
          className={`text-2xl font-bold tabular-nums ${isCheapest ? 'text-emerald-700' : 'text-slate-900'}`}
        >
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
          Scraping {name}...
        </span>
      ))}
    </div>
  );
}

/* -- Local database components section ----------------------------- */
function LocalComponentsSection({ components }: { components: ComponentDetail[] }) {
  if (!components || components.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4">
        <HiOutlineCpuChip className="h-5 w-5 text-violet-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-900">
            {components.length} component{components.length !== 1 ? 's' : ''} found in catalog
          </p>
          <p className="text-xs text-violet-600 mt-0.5">
            Matching products from the PCForge database
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <ProductCard key={component._id} component={component} />
        ))}
      </div>
    </div>
  );
}

interface SearchFiltersProps {
  excludedStores: string[];
  stores: string[];
  componentBrand: string;
  brands: string[];
  minPrice: string;
  maxPrice: string;
  onStoreToggle: (store: string, included: boolean) => void;
  onBrandChange: (brand: string) => void;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
  onClear: () => void;
}

function SearchFilters({
  excludedStores,
  stores,
  componentBrand,
  brands,
  minPrice,
  maxPrice,
  onStoreToggle,
  onBrandChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
}: SearchFiltersProps) {
  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:sticky md:top-24">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            PRICE FILTERS
          </span>
          <h2 className="text-sm font-extrabold text-slate-950">Refine Offers</h2>
        </div>
        {(excludedStores.length > 0 || componentBrand || minPrice || maxPrice) && (
          <button
            type="button"
            onClick={onClear}
            className="font-mono text-xs font-semibold text-slate-500 hover:text-slate-950 underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-5 pt-5">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-900">Component brand</legend>
          <select
            value={componentBrand}
            onChange={(event) => onBrandChange(event.target.value)}
            disabled={!brands.length}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">{brands.length ? 'All brands' : 'Brands load with results'}</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-900">Price range</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="sr-only" htmlFor="sidebar-min-price">
              Minimum price
            </label>
            <input
              id="sidebar-min-price"
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="Min ₹"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            <label className="sr-only" htmlFor="sidebar-max-price">
              Maximum price
            </label>
            <input
              id="sidebar-max-price"
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Max ₹"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-900">Company / store</legend>
          {stores.length ? (
            <div className="space-y-2">
              {stores.map((store) => (
                <label
                  key={store}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"
                >
                  <input
                    type="checkbox"
                    checked={!excludedStores.includes(store)}
                    onChange={(event) => onStoreToggle(store, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  {store}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Retailers will appear once offers load.</p>
          )}
        </fieldset>
      </div>
    </aside>
  );
}

/* -- Main page --------------------------------------------------- */
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(queryParam);
  const { data, isLoading, error, retry } = useRetailerSearch(queryParam);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  // Filters state
  const [excludedStores, setExcludedStores] = useState<string[]>([]);
  const [componentBrand, setComponentBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const availableStores = data ? Array.from(new Set(data.offers.map((o) => o.storeName))) : [];
  const availableBrands = data
    ? Array.from(new Set(data.offers.map((offer) => getComponentBrand(offer.productName)))).sort()
    : [];

  const filteredOffers =
    data?.offers.filter((offer) => {
      if (excludedStores.includes(offer.storeName)) return false;
      if (componentBrand && getComponentBrand(offer.productName) !== componentBrand) return false;
      if (minPrice && offer.price < Number(minPrice)) return false;
      if (maxPrice && offer.price > Number(maxPrice)) return false;
      return true;
    }) ?? [];

  const cheapestOffer = filteredOffers.reduce<RetailerOffer | null>(
    (lowest, offer) => (!lowest || offer.price < lowest.price ? offer : lowest),
    null,
  );

  const filterProps = {
    excludedStores,
    stores: availableStores,
    componentBrand,
    brands: availableBrands,
    minPrice,
    maxPrice,
    onStoreToggle: (store: string, included: boolean) =>
      setExcludedStores((current) =>
        included ? current.filter((item) => item !== store) : [...current, store],
      ),
    onBrandChange: setComponentBrand,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    onClear: () => {
      setExcludedStores([]);
      setComponentBrand('');
      setMinPrice('');
      setMaxPrice('');
    },
  };

  return (
    <section className="space-y-6">
      {/* -- Hero search bar -- */}
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
          PRICE ARBITRAGE ENGINE
        </span>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
          Live Retailer Price Comparison
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Real-time prices scraped continuously from MDComputers, PrimeABGB, and Vedant.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <div className="relative flex flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus-within:border-slate-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-900/10 transition">
            <HiOutlineMagnifyingGlass className="mr-2 h-4 w-4 flex-shrink-0 text-slate-400" />
            <input
              id="search-results-input"
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. RTX 4070 Super, Ryzen 7 7800X3D, DDR5 32GB..."
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <HiOutlineArrowPath className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <HiOutlineMagnifyingGlass className="h-3.5 w-3.5" />
            )}
            Search
          </button>
        </form>
      </header>

      {/* -- No query yet -- */}
      {!queryParam && !isLoading && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <HiOutlineMagnifyingGlass className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-bold text-slate-700">Search for any PC component</h2>
          <p className="mt-1 text-xs text-slate-500">
            Type a product model above to compare live prices across Indian PC retailers.
          </p>
        </div>
      )}

      {/* -- Loading state -- */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
          <SearchFilters {...filterProps} />
          <div className="space-y-4">
            <ScrapingStatus />
            <LoadingSkeleton />
          </div>
        </div>
      )}

      {/* -- Error state -- */}
      {!isLoading && error && (
        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
          <SearchFilters {...filterProps} />
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
            <HiOutlineExclamationCircle className="mx-auto h-8 w-8 text-rose-500" />
            <h2 className="mt-3 text-sm font-bold text-rose-800">Could not fetch prices</h2>
            <p className="mt-1 text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-500 shadow-xs"
            >
              <HiOutlineArrowPath className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* -- Results -- */}
      {!isLoading && !error && data && (
        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
          <SearchFilters {...filterProps} />

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {filteredOffers.length} retailer offer{filteredOffers.length !== 1 ? 's' : ''} for{' '}
                  <span className="font-bold text-slate-950">&ldquo;{data.query}&rdquo;</span>
                  {filteredOffers.length !== data.totalOffers && (
                    <span className="ml-1.5 text-slate-500 font-normal">
                      (filtered from {data.totalOffers})
                    </span>
                  )}
                </p>
              </div>
              {cheapestOffer && (
                <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono">
                  <HiOutlineCheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-800">
                    Best deal:{' '}
                    <span className="font-extrabold">
                      {formatPrice(cheapestOffer.price, cheapestOffer.currency)}
                    </span>{' '}
                    at {cheapestOffer.storeName}
                  </span>
                </div>
              )}
            </div>

            {/* No results at all */}
            {filteredOffers.length === 0 && (!data.localComponents || data.localComponents.length === 0) && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <HiOutlineMagnifyingGlass className="mx-auto h-8 w-8 text-slate-300" />
                <h2 className="mt-3 text-sm font-bold text-slate-700">No matching offers found</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Try searching for a simpler term like "4070" or "7800X3D", or clear your brand filter.
                </p>
              </div>
            )}


            {/* Offer cards */}
            {filteredOffers.length > 0 && (
              <div className="space-y-4">
                {filteredOffers.map((offer, index) => (
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
            )}

            {/* Browse catalog link */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center">
              <p className="text-sm text-slate-700">
                Looking to browse all components?{' '}
                <Link
                  to="/components"
                  className="font-semibold text-violet-600 underline-offset-2 hover:underline"
                >
                  Open the catalog →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
