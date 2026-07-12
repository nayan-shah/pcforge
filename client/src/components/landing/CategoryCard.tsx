interface CategoryCardProps {
  label: string;
}

export default function CategoryCard({ label }: CategoryCardProps) {
  return (
    <div className="group rounded-3xl border border-slate-200/80 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm shadow-violet-100 transition group-hover:bg-violet-100">
        <span className="text-2xl font-semibold">{label.charAt(0)}</span>
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-900">{label}</p>
    </div>
  );
}
