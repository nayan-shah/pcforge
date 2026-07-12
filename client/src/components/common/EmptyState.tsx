interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'No items yet',
  description = 'Add a new item to get started in the admin dashboard.',
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-100">
        <span className="text-2xl">📦</span>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
    </div>
  );
}
