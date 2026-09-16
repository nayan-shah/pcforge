import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { HiSearch, HiMenu, HiChevronDown, HiLogout, HiUser, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const links = [
  { label: 'Home', path: '/' },
  { label: 'PC Builder', path: '/builder' },
  { label: 'Catalog', path: '/components' },
  { label: 'Price Engine', path: '/search' },
  { label: 'AI Consultant', path: '/ai' },
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
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      {/* Top micro-bar: Telemetry status */}
      <div className="hidden border-b border-slate-800/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-1.5 text-[11px] text-slate-300 sm:block">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-slate-200">5 Indian Retailers Monitored Live:</span>
              <span className="text-slate-400">MDComputers • PrimeABGB • Vedant • Clarion • EliteHubs</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px]">
            <span>SOCKET COMPATIBILITY ENGINE</span>
            <span className="text-slate-600">|</span>
            <span>REAL-TIME PRICE ARBITRAGE</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Left: Custom Hardware Logo & Nav Links */}
        <div className="flex items-center gap-8">
          <NavLink
            to="/"
            className="group flex items-center gap-2.5 transition focus:outline-none"
          >
            {/* Precision Forged Microchip SVG Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md shadow-slate-900/20 ring-1 ring-slate-700/30 transition group-hover:shadow-lg group-hover:shadow-cyan-500/10 group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" className="stroke-white" />
                <rect x="8" y="8" width="8" height="8" rx="1" className="fill-cyan-400/20 stroke-cyan-400" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" className="stroke-slate-400" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-mono text-base font-bold tracking-tight text-slate-800">PC</span>
                <span className="text-base font-extrabold tracking-tight text-slate-950">FORGE</span>
                <span className="ml-1 rounded bg-gradient-to-r from-slate-100 to-slate-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 font-mono border border-slate-200/80">
                  v2.4
                </span>
              </div>
              <span className="text-[9px] font-medium tracking-wide text-slate-500 leading-none mt-0.5">
                Hardware & Pricing Engine
              </span>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Prominent Search Bar with Keyboard Shortcut */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2 text-slate-800 transition-all duration-200 focus-within:border-slate-400 focus-within:bg-white focus-within:shadow-soft focus-within:ring-2 focus-within:ring-slate-900/5">
            <HiSearch className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              id="navbar-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components (RTX 4090, Ryzen 7 7800X3D...)"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-slate-400 text-slate-800"
            />
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 shadow-sm">
              ⌘K
            </kbd>
          </div>
        </form>

        {/* Right: Auth & Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 lg:flex">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-1.5 pr-3 transition-all duration-200 hover:border-slate-300 hover:shadow-soft cursor-pointer"
                >
                  <img
                    src={user.avatar || '/default-avatar.jpg'}
                    alt={user.name}
                    className="h-7 w-7 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="text-[13px] font-semibold text-slate-800 max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <HiChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-1.5 shadow-soft-lg z-20"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
                        >
                          <HiUser className="h-4 w-4 text-slate-500" />
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
                        >
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Dashboard
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
                          >
                            <span className="h-2 w-2 rounded-full bg-cyan-600" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-slate-100" />
                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                          <HiLogout className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:from-slate-700 hover:to-slate-800 shadow-sm shadow-slate-900/20"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden cursor-pointer"
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
            className="overflow-hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto max-w-[1536px] px-4 py-5 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="sm:hidden">
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800">
                  <HiSearch className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search components..."
                    className="w-full bg-transparent text-[13px] outline-none placeholder:text-slate-400 text-slate-800"
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
                      `rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <hr className="border-slate-100" />

              {/* Mobile Auth */}
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <img
                      src={user.avatar || '/default-avatar.jpg'}
                      alt={user.name}
                      className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <HiUser className="h-4 w-4 text-slate-500" />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <span className="h-2 w-2 rounded-full bg-cyan-600" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <HiLogout className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full text-center rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="w-full text-center rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 text-[13px] font-semibold text-white hover:from-slate-700 hover:to-slate-800 shadow-sm"
                  >
                    Register
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
