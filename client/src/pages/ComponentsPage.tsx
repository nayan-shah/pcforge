import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductGrid from '../components/catalog/ProductGrid';
import SearchBar from '../components/catalog/SearchBar';
import ProductFilters from '../components/catalog/ProductFilters';
import SortDropdown from '../components/catalog/SortDropdown';
import Pagination from '../components/catalog/Pagination';
import type { ComponentSummary } from '../types/component';

const sampleComponents: ComponentSummary[] = [
  {
    _id: '1',
    name: 'Ryzen 9 7950X',
    brand: 'AMD',
    category: 'CPU',
    images: ['https://via.placeholder.com/400x300'],
    stockStatus: 'In Stock',
    tags: ['Zen 4', '16-Core', 'AM5'],
    rating: 4.8,
    prices: [
      {
        storeName: 'FastPC',
        productUrl: 'https://example.com/product/1',
        currentPrice: 699,
        currency: 'USD',
        availability: 'In Stock',
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    _id: '2',
    name: 'GeForce RTX 4080',
    brand: 'NVIDIA',
    category: 'GPU',
    images: ['https://via.placeholder.com/400x300'],
    stockStatus: 'Preorder',
    tags: ['Ada Lovelace', '16GB', 'Ray Tracing'],
    rating: 4.7,
    prices: [
      {
        storeName: 'GPU Mart',
        productUrl: 'https://example.com/product/2',
        currentPrice: 1199,
        currency: 'USD',
        availability: 'Preorder',
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    _id: '3',
    name: 'Corsair Vengeance DDR5 32GB',
    brand: 'Corsair',
    category: 'RAM',
    images: ['https://via.placeholder.com/400x300'],
    stockStatus: 'In Stock',
    tags: ['DDR5', '32GB', '6000MHz'],
    rating: 4.6,
    prices: [
      {
        storeName: 'MemoryHub',
        productUrl: 'https://example.com/product/3',
        currentPrice: 219,
        currency: 'USD',
        availability: 'In Stock',
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
];

export default function ComponentsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredComponents = useMemo(() => {
    let result = sampleComponents;

    if (query) {
      result = result.filter((component) =>
        component.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category) {
      result = result.filter((component) => component.category === category);
    }

    if (brand) {
      result = result.filter((component) => component.brand === brand);
    }

    result = result.slice();
    if (sortBy === 'price') {
      result.sort((a, b) => (a.prices[0]?.currentPrice ?? 0) - (b.prices[0]?.currentPrice ?? 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [query, category, brand, sortBy]);

  const totalPages = Math.max(Math.ceil(filteredComponents.length / pageSize), 1);
  const pageComponents = filteredComponents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelect = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Components</h1>
            <p className="mt-2 text-slate-600">Discover PC parts for your next build.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SearchBar value={query} onChange={setQuery} />
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <ProductFilters
          category={category}
          brand={brand}
          onCategoryChange={setCategory}
          onBrandChange={setBrand}
        />

        <div className="space-y-6">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
              Loading components...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center text-rose-700 shadow-sm">
              <p className="text-lg font-semibold">Unable to load components</p>
              <p className="mt-2">{error}</p>
            </div>
          ) : (
            <>
              <ProductGrid components={pageComponents} onSelect={handleSelect} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
