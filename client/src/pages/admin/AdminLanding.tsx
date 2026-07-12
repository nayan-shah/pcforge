import { Link } from 'react-router-dom';

export default function AdminLanding() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm shadow-slate-900/5">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">PCForge Admin</h1>
      <p className="mt-4 text-slate-600">Welcome to the PCForge admin portal. Use the navigation panel to access dashboard tools and management pages.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/home"
          className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-left text-sm text-slate-700 transition hover:border-violet-500 hover:bg-violet-50"
        >
          <h2 className="text-lg font-semibold text-slate-900">Dashboard Home</h2>
          <p className="mt-2 text-slate-500">View inventory, analytics, and admin insights.</p>
        </Link>
        <Link
          to="/admin/components"
          className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-left text-sm text-slate-700 transition hover:border-violet-500 hover:bg-violet-50"
        >
          <h2 className="text-lg font-semibold text-slate-900">Components</h2>
          <p className="mt-2 text-slate-500">Manage PC components and inventory listings.</p>
        </Link>
      </div>
    </div>
  );
}
