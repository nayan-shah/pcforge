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

const PAGE_SIZE = 12;
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
    limit: PAGE_SIZE,
  });

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">PC components</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Build with confidence</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Compare parts, prices, and availability for your next PC.</p>
          </div>
          <div className="space-y-3">
            <SearchBar value={searchInput} onChange={setSearchInput} />
            <SortDropdown value={sort} onChange={(value) => updateParams({ sort: value })} />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ProductFilters
          category={category}
          brand={brandInput}
          onCategoryChange={(value) => updateParams({ category: value })}
          onBrandChange={setBrandInput}
        />

        <div className="space-y-6">
          {!isLoading && !error && data && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{data.totalCount} component{data.totalCount === 1 ? '' : 's'} found</p>
          )}
          {isLoading ? <ProductGridSkeleton count={PAGE_SIZE} /> : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center dark:border-rose-900 dark:bg-rose-950/30">
              <HiOutlineExclamationCircle className="mx-auto h-11 w-11 text-rose-500" />
              <h2 className="mt-4 text-lg font-semibold text-rose-800 dark:text-rose-200">Unable to load components</h2>
              <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>
              <button type="button" onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500"><HiOutlineArrowPath className="h-4 w-4" /> Retry</button>
            </div>
          ) : data?.components.length ? (
            <>
              <ProductGrid components={data.components} />
              {data.totalPages > 1 && <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={(nextPage) => updateParams({ page: String(nextPage) })} />}
            </>
          ) : (
            <EmptyState title="No components found" description="Try clearing a filter or searching for a different component." />
          )}
        </div>
      </div>
    </section>
  );
}
