import type { ComponentSummary } from '../../types/component';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  products: ComponentSummary[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-card">
      <div>
        <h3 className="text-base font-bold text-slate-900">Related products</h3>
        <p className="mt-1 text-sm text-slate-500">
          Discover parts that are often paired with this component.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} component={product} />
        ))}
      </div>
    </section>
  );
}
