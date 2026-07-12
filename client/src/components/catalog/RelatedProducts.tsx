import type { ComponentSummary } from '../../types/component';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  products: ComponentSummary[];
  onSelect: (id: string) => void;
}

export default function RelatedProducts({ products, onSelect }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">Related products</h3>
        <p className="mt-2 text-sm text-slate-600">Discover parts that are often paired with this component.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} component={product} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
