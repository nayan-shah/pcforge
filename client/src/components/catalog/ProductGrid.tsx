import type { ComponentSummary } from '../../types/component';
import ProductCard from './ProductCard';

interface ProductGridProps {
  components: ComponentSummary[];
}

export default function ProductGrid({ components }: ProductGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {components.map((component) => <ProductCard key={component._id} component={component} />)}
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading components">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3 p-5"><div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><div className="h-5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><div className="h-4 w-2/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><div className="h-8 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /></div>
        </div>
      ))}
    </div>
  );
}
