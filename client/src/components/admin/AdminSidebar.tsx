import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/admin/home' },
  { label: 'Components', path: '/admin/components' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 lg:block">
      <div className="mb-8">
        <div className="text-xl font-semibold text-slate-900">PCForge Admin</div>
        <p className="mt-2 text-sm text-slate-500">Manage components, categories, and system settings.</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
