import type { ComponentSummary } from '../../types/component';
import ProductCard from './ProductCard';

interface ProductGridProps {
  components: ComponentSummary[];
}

export default function ProductGrid({ components }: ProductGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {components.map((component) => (
        <ProductCard key={component._id} component={component} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading components">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
        >
          <div className="h-48 skeleton-shimmer" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-16 rounded-md skeleton-shimmer" />
            <div className="h-4 w-4/5 rounded-md skeleton-shimmer" />
            <div className="h-3 w-2/5 rounded-md skeleton-shimmer" />
            <div className="h-8 w-1/2 rounded-md skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
