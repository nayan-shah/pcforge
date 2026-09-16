import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiShieldCheck,
  HiClock,
  HiLightningBolt,
  HiTrendingUp,
  HiOutlineArrowRight,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import {
  HiOutlineCpuChip,
  HiOutlineCheckCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import { getFeaturedComponents } from '../../api/componentApi';
import type { ComponentDetail } from '../../types/component';
import CategoryIcon from '../common/CategoryIcon';
import { formatPrice } from '../../utils/formatters';
import { getLowestPrice } from '../../utils/price';
import { CATEGORY_COLORS } from '../../constants/categories';

// ── Live Featured Component Card ─────────────────────────────────────

function FeaturedCard({ component }: { component: ComponentDetail }) {
  const navigate = useNavigate();
  const lowestOffer = getLowestPrice(component);
  const catColor =
    CATEGORY_COLORS[component.category] ?? 'bg-slate-50 text-slate-700 border-slate-200';
  const storeCount = component.prices?.filter((p) => p.productUrl).length ?? 0;

  return (
    <div
      className="group flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-card-hover cursor-pointer overflow-hidden"
      onClick={() => navigate(`/components/${component._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/components/${component._id}`)}
    >
      {/* Image Area */}
      <div className="relative flex h-48 items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/50 p-4 border-b border-slate-100 overflow-hidden">
        {component.images && component.images[0] ? (
          <img
            src={component.images[0]}
            alt={component.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              const parent = el.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'flex flex-col items-center justify-center text-slate-300 gap-1';
                fallback.innerHTML = `<span class="text-xs font-mono font-bold">${component.category}</span>`;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
            <CategoryIcon category={component.category} className="h-10 w-10 text-slate-300" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {component.category}
            </span>
          </div>
        )}

        {/* Store count badge */}
        {storeCount > 0 && (
          <span className="absolute top-2.5 right-2.5 rounded-md bg-white/95 backdrop-blur-xs border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 shadow-2xs">
            {storeCount} store{storeCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* In stock dot */}
        {component.stockStatus === 'In Stock' && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            In Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${catColor}`}
            >
              {component.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">{component.brand}</span>
          </div>
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug group-hover:text-slate-950">
            {component.name}
          </h3>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Lowest live price</p>
            {lowestOffer ? (
              <p className="font-mono text-base font-bold text-slate-950">
                {formatPrice(lowestOffer.price, lowestOffer.currency)}
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-400 italic">Price N/A</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-all duration-200 group-hover:bg-slate-800 group-hover:shadow-sm">
            Compare <HiOutlineArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Live "Deals of the Day" deal card (compact) ──────────────────────

function DealCard({ component }: { component: ComponentDetail }) {
  const navigate = useNavigate();
  const lowestOffer = getLowestPrice(component);

  return (
    <div
      className="group flex flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-hover cursor-pointer"
      onClick={() => navigate(`/components/${component._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/components/${component._id}`)}
    >
      {/* Image area */}
      <div className="h-36 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-lg border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden">
        {component.images && component.images[0] ? (
          <img
            src={component.images[0]}
            alt={component.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <CategoryIcon category={component.category} className="h-8 w-8 text-slate-300" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {component.category}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{component.brand}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-xs line-clamp-2 min-h-[32px] leading-tight mt-1.5">
            {component.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2">
          {lowestOffer ? (
            <div className="flex items-baseline justify-between gap-1">
              <span className="font-mono text-sm font-extrabold text-slate-950">
                {formatPrice(lowestOffer.price, lowestOffer.currency)}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                Lowest
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Price unavailable</p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/components/${component._id}`);
            }}
            className="w-full py-2 rounded-lg bg-slate-900 text-[11px] font-semibold text-white transition hover:bg-slate-800 shadow-xs"
          >
            Compare Prices
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loaders ──────────────────────────────────────────────────

function GridSkeleton({ count, tall = false }: { count: number; tall?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200/80 bg-white overflow-hidden"
        >
          <div className={`skeleton-shimmer ${tall ? 'h-44' : 'h-36'}`} />
          <div className="p-4 space-y-2">
            <div className="h-3 w-16 rounded-md skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
            <div className="mt-3 h-5 w-24 rounded-md skeleton-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Main LandingPage ──────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  // Live components state
  const [featured, setFeatured] = useState<ComponentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getFeaturedComponents(12);
      setFeatured(data);
    } catch (err) {
      setLoadError('Could not load components. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  // Filtered by active category tab
  const filtered =
    activeTab === 'All' ? featured : featured.filter((c) => c.category === activeTab);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const categories = [
    { name: 'CPU', label: 'Processors' },
    { name: 'GPU', label: 'Graphics Cards' },
    { name: 'Motherboard', label: 'Motherboards' },
    { name: 'RAM', label: 'Memory' },
    { name: 'SSD', label: 'Solid State Drives' },
    { name: 'PSU', label: 'Power Supplies' },
    { name: 'Cooler', label: 'CPU Coolers' },
    { name: 'Cabinet', label: 'Chassis' },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 1. State-of-the-art Hardware Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl">
        {/* Subtle Tech Grid Texture */}
        <div className="absolute inset-0 bg-tech-grid-dark opacity-30 pointer-events-none" />
        {/* Ambient gradient orbs for depth */}
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 h-60 w-60 rounded-full bg-indigo-500/6 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-80 rounded-full bg-cyan-400/4 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 p-8 sm:p-12 lg:p-14 items-center">
          {/* Left: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-[11px] font-mono font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>INDIAN HARDWARE ENGINE & REAL-TIME ARBITRAGE</span>
            </div>

            <h1 className="text-3xl font-extrabold sm:text-5xl leading-[1.15] tracking-tight">
              Build with absolute compatibility. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-cyan-400">
                Buy at absolute lowest price.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Stop manually cross-checking 6 browser tabs. PCForge continuously tracks prices across
              <strong className="text-white"> MDComputers, PrimeABGB, and Vedant</strong>, validates socket
              and power clearances automatically, and routes every component to the cheapest vendor.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/builder')}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-950 hover:bg-slate-100 shadow-md shadow-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <HiOutlineWrenchScrewdriver className="h-4 w-4" />
                Launch Interactive PC Builder
              </button>
              <button
                onClick={() => navigate('/components')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
              >
                Explore Hardware Catalog
                <HiOutlineArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" /> AM5 / LGA1700 Sockets
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" /> TDP Wattage Headroom
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" /> Zero Vendor Markup
              </span>
            </div>
          </div>

          {/* Right: Live Rig Telemetry Benchmark Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl space-y-4 glow-cyan">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Live Price Arbitrage Preview
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  SAVED ₹12,800
                </span>
              </div>

              {/* Component Rows */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div>
                    <p className="font-sans font-semibold text-slate-200">Ryzen 7 7800X3D</p>
                    <p className="text-[10px] text-slate-500">Vedant Computers</p>
                  </div>
                  <span className="font-bold text-slate-200">₹36,490</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div>
                    <p className="font-sans font-semibold text-slate-200">RTX 4070 Ti Super 16GB</p>
                    <p className="text-[10px] text-slate-500">PrimeABGB</p>
                  </div>
                  <span className="font-bold text-slate-200">₹79,900</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div>
                    <p className="font-sans font-semibold text-slate-200">MSI B650 Tomahawk WiFi</p>
                    <p className="text-[10px] text-slate-500">MDComputers</p>
                  </div>
                  <span className="font-bold text-slate-200">₹21,200</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div>
                    <p className="font-sans font-semibold text-slate-200">Corsair 32GB DDR5-6000</p>
                    <p className="text-[10px] text-slate-500">Vedant Computers</p>
                  </div>
                  <span className="font-bold text-slate-200">₹9,950</span>
                </div>
              </div>

              {/* Total & Headroom Footer */}
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Calculated Draw: 485W</p>
                  <p className="text-xs font-mono font-bold text-cyan-400">Recommended PSU: 750W</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Best Combined Price</p>
                  <p className="font-mono text-base font-extrabold text-white">₹1,47,540</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/builder')}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition text-center shadow-xs"
              >
                Configure Custom Build →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hardware Category Navigator */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">
              Hardware Component Directory
            </h2>
            <p className="text-xs text-slate-500">Select a category to inspect live market pricing</p>
          </div>
          <Link
            to="/components"
            className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1"
          >
            View All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => {
                setActiveTab(cat.name);
                const el = document.getElementById('shop-by-component');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                activeTab === cat.name
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                  : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-card hover:scale-[1.01]'
              }`}
            >
              <CategoryIcon
                category={cat.name}
                className={`h-6 w-6 mb-2 transition ${
                  activeTab === cat.name
                    ? 'text-cyan-400'
                    : 'text-slate-500 group-hover:text-slate-900'
                }`}
              />
              <span className="text-xs font-bold font-mono">{cat.name}</span>
              <span className={`text-[10px] truncate max-w-full ${activeTab === cat.name ? 'text-slate-300' : 'text-slate-400'}`}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Deals of the Day — LIVE DATA */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-card space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">
              Today's Price Drops & Spotlight Deals
            </h2>
            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-rose-200">
              <HiClock className="h-3.5 w-3.5" />
              <span>
                {timeLeft.hours.toString().padStart(2, '0')}:
                {timeLeft.minutes.toString().padStart(2, '0')}:
                {timeLeft.seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadFeatured}
              title="Refresh components"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 transition"
            >
              <HiOutlineRefresh className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
            <Link
              to="/components"
              className="text-xs font-bold text-slate-900 hover:underline"
            >
              All Components →
            </Link>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
            <HiOutlineExclamationCircle className="mx-auto h-8 w-8 text-rose-500" />
            <p className="mt-2 text-xs font-semibold text-rose-700">{loadError}</p>
            <button
              onClick={loadFeatured}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition"
            >
              <HiOutlineRefresh className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <GridSkeleton count={4} />
            ) : (
              featured.slice(0, 4).map((c) => <DealCard key={c._id} component={c} />)
            )}
          </div>
        )}
      </section>

      {/* 4. Secondary Platform Banners */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6 sm:p-8 flex flex-col justify-between shadow-soft-lg relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <span className="inline-flex rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 border border-slate-700">
              SOCKET & CLEARANCE ENGINE
            </span>
            <h3 className="text-xl font-bold text-white">Interactive Custom PC Builder</h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-md">
              Configure your system with automated checks for motherboard socket compatibility, RAM clearance under air coolers, and GPU length constraints.
            </p>
          </div>
          <div className="pt-6 relative z-10">
            <button
              onClick={() => navigate('/builder')}
              className="rounded-lg bg-white text-slate-950 px-5 py-2.5 text-xs font-bold hover:bg-slate-100 transition shadow-sm"
            >
              Start Assembly →
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-shadow duration-300">
          <div className="space-y-3">
            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
              AI ARCHITECT
            </span>
            <h3 className="text-xl font-bold text-slate-950">AI Hardware Consultant</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md">
              State your budget and target workload (e.g. 1440p gaming, 4K Premiere Pro, or machine learning), and get a balanced part breakdown instantly.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => navigate('/ai')}
              className="rounded-lg bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 transition"
            >
              Consult AI Architect →
            </button>
          </div>
        </div>
      </section>

      {/* 5. Shop by Component — LIVE DATA with Category Filter */}
      <section id="shop-by-component" className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-card space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">
              Component Catalog & Live Price Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading
                ? 'Fetching live Indian retailer prices…'
                : `${featured.length} components synced across MDComputers, PrimeABGB, and Vedant`}
            </p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {['All', 'CPU', 'GPU', 'RAM', 'Motherboard', 'SSD', 'PSU', 'Cooler', 'Cabinet'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex-shrink-0 ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab === 'All' ? 'All Products' : tab}
                </button>
              ),
            )}
          </div>
        </div>

        {loadError ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-400 text-xs">
            {loadError}
          </div>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <GridSkeleton count={8} tall />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-xs font-semibold text-slate-600">
              No {activeTab !== 'All' ? activeTab : ''} components in the catalog yet.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Add components via the admin panel, or try another category.
            </p>
            <Link
              to="/components"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline"
            >
              Browse catalog <HiOutlineArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <FeaturedCard key={c._id} component={c} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Retailer Verification & Trust Grid */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex items-start gap-4">
          <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 text-slate-800 rounded-lg flex-shrink-0 border border-slate-200/50">
            <HiLightningBolt className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-xs">Real-Time Scraping & Stock Detection</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Never buy an out-of-stock part. Our scrapers continuously monitor inventory flags directly on vendor checkout pages.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex items-start gap-4">
          <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 text-slate-800 rounded-lg flex-shrink-0 border border-slate-200/50">
            <HiShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-xs">Full Manufacturer Warranty</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              We exclusively list certified Indian IT distributors (Acro, Rashi, Supertron) ensuring serial numbers are genuine.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex items-start gap-4">
          <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 text-slate-800 rounded-lg flex-shrink-0 border border-slate-200/50">
            <HiTrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-xs">Multi-Store Price Arbitrage</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Buying your CPU from Vedant and GPU from PrimeABGB saves an average of ₹8,000 to ₹15,000 per build.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
