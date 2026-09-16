import type { ComponentDetail } from '../../types/component';
import { resolveSpecifications } from '../../utils/specs';
import CategoryIcon from '../common/CategoryIcon';

interface ProductInfoProps {
  component: ComponentDetail;
}

export default function ProductInfo({ component }: ProductInfoProps) {
  const resolved = resolveSpecifications(component);

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    'In Stock': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'Out of Stock': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    Preorder: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  };

  const status = statusColors[component.stockStatus] || {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-700">
            <CategoryIcon category={component.category} className="h-3 w-3" />
            {component.category}
          </span>
          <span className="text-xs font-semibold text-slate-500">{component.brand}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.bg} ${status.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {component.stockStatus || 'In Stock'}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-950 leading-tight">
          {component.name}
        </h2>

        {/* Quick Specs Highlight Strip */}
        {resolved.keyBadges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {resolved.keyBadges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200/90 px-2.5 py-1 font-mono text-xs text-slate-800 shadow-xs"
              >
                <span className="text-slate-400 text-[10px] uppercase font-bold">{badge.label}:</span>
                <span className="font-extrabold text-slate-950">{badge.value}</span>
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {resolved.inferredDescription}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 border border-slate-100">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Brand Manufacturer
          </span>
          <p className="mt-0.5 text-sm font-bold text-slate-900">{component.brand}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 border border-slate-100">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Component Classification
          </span>
          <p className="mt-0.5 text-sm font-bold text-slate-900">{component.category}</p>
        </div>

        {resolved.powerWatts > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 border border-slate-100">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Power Consumption (TDP)
            </span>
            <p className="mt-0.5 font-mono text-sm font-bold text-amber-700">
              ~{resolved.powerWatts} Watts
            </p>
          </div>
        )}

        {component.tags && component.tags.length > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 border border-slate-100">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Keywords &amp; Series
            </span>
            <p className="mt-0.5 text-xs font-semibold text-slate-700 truncate">
              {component.tags.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
