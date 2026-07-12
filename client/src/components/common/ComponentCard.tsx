interface ComponentCardProps {
  title: string;
  category: string;
  price: string;
  status: string;
  image?: string;
}

export default function ComponentCard({ title, category, price, status, image }: ComponentCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/20">
      <div className="bg-slate-100 p-6 dark:bg-slate-900">
        <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-800">
          {image ? (
            <img src={image} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No image</div>
          )}
        </div>
      </div>

      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
            {category}
          </span>
          <span className="text-sm font-semibold text-slate-900">{price}</span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{status}</p>
        </div>

        <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          View details
        </button>
      </div>
    </article>
  );
}
