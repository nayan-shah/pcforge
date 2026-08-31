import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { HiSearch, HiMenu, HiChevronDown, HiLogout, HiUser, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const links = [
  { label: 'Home', path: '/' },
  { label: 'Build PC', path: '/builder' },
  { label: 'Compare Prices', path: '/search' },
  { label: 'AI Assistant', path: '/ai' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-6 px-3 py-4 sm:px-4 lg:px-5">
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

        {/* Center: Prominent Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition shadow-inner">
            <HiSearch className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              id="navbar-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components (e.g. RTX 4090, Ryzen 9...)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </form>

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
                    src={
                      user.avatar ||
                      '/default-avatar.jpg'
                    }
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-violet-100"
                  />
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <HiChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg shadow-slate-900/5 z-20">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <HiUser className="h-4 w-4 text-violet-500" />
                        My Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-500 ml-1 mr-1" />
                        Dashboard
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden cursor-pointer"
          >
            {isMobileMenuOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="mx-auto max-w-[1536px] px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="sm:hidden">
                <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition shadow-inner">
                  <HiSearch className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search components..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </form>

              {/* Nav Links */}
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <hr className="border-slate-100" />

              {/* Mobile Auth Links */}
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img
                      src={
                        user.avatar ||
                        '/default-avatar.jpg'
                      }
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover border border-violet-100"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <HiUser className="h-4 w-4 text-violet-500" />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 ml-1 mr-1" />
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span className="h-2 w-2 rounded-full bg-violet-600 ml-1 mr-1" />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50/50 transition text-left cursor-pointer"
                  >
                    <HiLogout className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full text-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="w-full text-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
