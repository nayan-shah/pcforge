import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineArrowPath, HiOutlineExclamationCircle } from 'react-icons/hi2';
import ProductFilters from '../components/catalog/ProductFilters';
import ProductGrid, { ProductGridSkeleton } from '../components/catalog/ProductGrid';
import SearchBar from '../components/catalog/SearchBar';
import SortDropdown from '../components/catalog/SortDropdown';
import Pagination from '../components/catalog/Pagination';
import EmptyState from '../components/common/EmptyState';
import useCatalogComponents from '../hooks/useCatalogComponents';
import { CATALOG_PAGE_SIZE } from '../constants/pagination';

const getPage = (value: string | null) => Math.max(1, Number.parseInt(value || '1', 10) || 1);

export default function ComponentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const brand = searchParams.get('brand') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = getPage(searchParams.get('page'));
  const [searchInput, setSearchInput] = useState(search);
  const [brandInput, setBrandInput] = useState(brand);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => setSearchInput(search), [search]);
  useEffect(() => setBrandInput(brand), [brand]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== search) updateParams({ search: searchInput });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (brandInput !== brand) updateParams({ brand: brandInput });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [brandInput, brand]);

  const { data, isLoading, error, retry } = useCatalogComponents({
    search: search || undefined,
    category: category || undefined,
    brand: brand || undefined,
    sort,
    page,
    limit: CATALOG_PAGE_SIZE,
  });

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              HARDWARE DIRECTORY
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
              PC Component Catalog
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Compare parts, specifications, and live retailer pricing across India.
            </p>
          </div>
          <div className="space-y-2">
            <SearchBar value={searchInput} onChange={setSearchInput} />
            <SortDropdown value={sort} onChange={(value) => updateParams({ sort: value })} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ProductFilters
          category={category}
          brand={brandInput}
          onCategoryChange={(value) => updateParams({ category: value })}
          onBrandChange={setBrandInput}
          onClear={() => {
            setBrandInput('');
            updateParams({ category: '', brand: '' });
          }}
        />

        <div className="space-y-6">
          {!isLoading && !error && data && (
            <p className="font-mono text-xs text-slate-500">
              {data.totalCount} component{data.totalCount === 1 ? '' : 's'} cataloged
            </p>
          )}
          {isLoading ? (
            <ProductGridSkeleton count={CATALOG_PAGE_SIZE} />
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
              <HiOutlineExclamationCircle className="mx-auto h-8 w-8 text-rose-500" />
              <h2 className="mt-3 text-base font-bold text-rose-800">
                Unable to load catalog components
              </h2>
              <p className="mt-1 text-xs text-rose-700">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition shadow-xs"
              >
                <HiOutlineArrowPath className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          ) : data?.components.length ? (

            <>
              <ProductGrid components={data.components} />
              {data.totalPages > 1 && (
                <Pagination
                  currentPage={data.currentPage}
                  totalPages={data.totalPages}
                  onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No components found"
              description="Try clearing a filter or searching for a different component."
            />
          )}
        </div>
      </div>
    </section>
  );
}
