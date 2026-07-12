import AdminSidebar from './AdminSidebar';

interface AdminPageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AdminPageShell({ title, description, children }: AdminPageShellProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/20">
          <header className="mb-8">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">Admin</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
            {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{description}</p> : null}
          </header>

          {children}
        </section>
      </div>
    </div>
  );
}
