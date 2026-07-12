interface ProductCardProps {
  title: string;
  category: string;
  price: string;
  vendor: string;
  badge: string;
}

export default function ProductCard({ title, category, price, vendor, badge }: ProductCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          {category}
        </span>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
          {badge}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm text-slate-500">{vendor}</p>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-2xl font-semibold text-slate-900">{price}</span>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          View
        </button>
      </div>
    </div>
  );
}
