import { NavLink } from 'react-router-dom';
import { HiShoppingCart, HiSearch, HiMenu } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';

const links = [
  { label: 'Home', path: '/' },
  { label: 'Build PC', path: '/builder' },
  { label: 'Compare Prices', path: '/compare' },
  { label: 'AI Assistant', path: '/ai' },
];

export default function Navbar() {
  const { cart, setIsCartDrawerOpen } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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

        {/* Right: Cart, Auth, and Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* Cart Icon Option on Top */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition shadow-sm hover:shadow"
          >
            <HiShoppingCart className="h-5 w-5 text-violet-500" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Auth links */}
          <div className="hidden items-center gap-2 lg:flex">
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
