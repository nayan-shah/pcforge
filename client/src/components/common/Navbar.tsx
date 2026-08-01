import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HiSearch, HiMenu, HiChevronDown, HiLogout, HiUser } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const links = [
  { label: 'Home', path: '/' },
  { label: 'Build PC', path: '/builder' },
  { label: 'Compare Prices', path: '/compare' },
  { label: 'AI Assistant', path: '/ai' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Left: Branding & Nav Links */}
        <div className="flex items-center gap-6">
          <NavLink 
            to="/" 
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-base font-bold text-white shadow-md shadow-violet-500/10 tracking-tight"
          >
            PCForge
          </NavLink>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition ${
                    isActive ? 'text-violet-600' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Flipkart-style Prominent Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition shadow-inner">
            <HiSearch className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search components (e.g. RTX 4090, Ryzen 9...)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        {/* Right: Auth and Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* Auth links / Profile dropdown */}
          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 hover:bg-slate-50 transition shadow-sm hover:shadow cursor-pointer"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-violet-100"
                  />
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">{user.name}</span>
                  <HiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg shadow-slate-900/5 z-20">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <HiUser className="h-4 w-4 text-violet-500" />
                        My Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                        >
                          <span className="h-2 w-2 rounded-full bg-violet-600 ml-1 mr-1" />
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50/50 transition text-left cursor-pointer"
                      >
                        <HiLogout className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button className="inline-flex items-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden">
            <HiMenu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
