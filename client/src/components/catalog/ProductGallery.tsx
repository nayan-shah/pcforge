import type { ComponentDetail } from '../../types/component';

interface ProductGalleryProps {
  component: ComponentDetail;
}

export default function ProductGallery({ component }: ProductGalleryProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl bg-slate-100 p-6">
          <img
            src={component.images[0] ?? '/placeholder-image.svg'}
            alt={component.name}
            className="mx-auto h-full max-h-[420px] w-full object-contain"
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {component.category}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{component.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{component.brand}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Stock status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{component.stockStatus}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Reviews</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {component.rating.toFixed(1)} ★ · {component.reviewCount} reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {component.images.slice(1, 4).map((image, index) => (
          <div key={index} className="overflow-hidden rounded-3xl bg-slate-100 p-4">
            <img src={image} alt={`${component.name} image ${index + 2}`} className="h-40 w-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
