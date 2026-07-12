import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/catalog/ProductCard';
import type { ComponentSummary } from '../types/component';

const mockComponents: ComponentSummary[] = [
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
];

export default function Catalog() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredComponents = useMemo(() => {
    return mockComponents
      .filter((component) => {
        return (
          (!query || component.name.toLowerCase().includes(query.toLowerCase())) &&
          (!category || component.category === category) &&
          (!brand || component.brand === brand)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          return (a.prices[0]?.currentPrice ?? 0) - (b.prices[0]?.currentPrice ?? 0);
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [query, category, brand, sortBy]);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">PCForge Components</h1>
            <p className="mt-2 text-slate-600">Browse and filter components for your next build.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search components..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">All</option>
                <option value="CPU">CPU</option>
                <option value="GPU">GPU</option>
                <option value="Motherboard">Motherboard</option>
                <option value="RAM">RAM</option>
                <option value="SSD">SSD</option>
                <option value="HDD">HDD</option>
                <option value="PSU">PSU</option>
                <option value="Cabinet">Cabinet</option>
                <option value="Cooler">Cooler</option>
                <option value="Monitor">Monitor</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Mouse">Mouse</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Brand</label>
              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">All</option>
                <option value="AMD">AMD</option>
                <option value="NVIDIA">NVIDIA</option>
                <option value="Corsair">Corsair</option>
                <option value="ASUS">ASUS</option>
                <option value="Samsung">Samsung</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredComponents.map((component) => (
              <ProductCard
                key={component._id}
                component={component}
                onSelect={(id) => navigate(`/product/${id}`)}
              />
            ))}
          </div>

          {filteredComponents.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
              No components match your criteria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
