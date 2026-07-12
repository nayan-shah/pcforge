import type { ComponentSummary } from '../../types/component';
import ProductCard from './ProductCard';

interface ProductGridProps {
  components: ComponentSummary[];
  onSelect: (id: string) => void;
}

export default function ProductGrid({ components, onSelect }: ProductGridProps) {
  if (components.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
        No components match your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {components.map((component) => (
        <ProductCard key={component._id} component={component} onSelect={onSelect} />
      ))}
    </div>
  );
}
