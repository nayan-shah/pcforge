import { NavLink } from 'react-router-dom';

const links = [
  { label: 'Home', path: '/' },
  { label: 'Build PC', path: '/builder' },
  { label: 'Compare Prices', path: '/compare' },
  { label: 'AI Assistant', path: '/ai' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/10">
            PCForge
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden items-center rounded-full border border-slate-200/80 bg-slate-100 px-3 py-2 text-sm text-slate-600 shadow-sm sm:flex">
            <span className="mr-2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search components"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <NavLink
            to="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Sign Up
          </NavLink>
          <button className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden">
            <span className="sr-only">Open menu</span>
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
