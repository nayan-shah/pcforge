export default function AdminTopbar() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/20">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">Admin Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome back, Admin</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span className="font-semibold text-slate-900 dark:text-slate-100">Last login:</span> Today
        </div>
        <button className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500">
          Create report
        </button>
      </div>
    </div>
  );
}
