import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiChevronLeft,
  HiChevronRight,
  HiShieldCheck,
  HiClock,
  HiLightningBolt,
  HiTrendingUp,
  HiOutlineArrowRight,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { getFeaturedComponents } from '../../api/componentApi';
import type { ComponentDetail } from '../../types/component';

// ── Helpers ─────────────────────────────────────────────────────────

const formatPrice = (price: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

const CATEGORY_ICONS: Record<string, string> = {
  CPU: '🎛️', GPU: '📼', RAM: '🐏', Motherboard: '🧩',
  SSD: '💾', HDD: '🖴', PSU: '⚡', Cabinet: '🖥️',
  Cooler: '🌀', Monitor: '🖵', Keyboard: '⌨️', Mouse: '🖱️',
};

const CATEGORY_COLORS: Record<string, string> = {
  CPU: 'bg-blue-50 text-blue-700 border-blue-100',
  GPU: 'bg-violet-50 text-violet-700 border-violet-100',
  RAM: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Motherboard: 'bg-orange-50 text-orange-700 border-orange-100',
  SSD: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  HDD: 'bg-slate-50 text-slate-700 border-slate-200',
  PSU: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  Cabinet: 'bg-rose-50 text-rose-700 border-rose-100',
  Cooler: 'bg-teal-50 text-teal-700 border-teal-100',
  Monitor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Keyboard: 'bg-pink-50 text-pink-700 border-pink-100',
  Mouse: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
};

function getLowestPrice(component: ComponentDetail) {
  if (!component.prices || component.prices.length === 0) return null;
  let lowest = Infinity;
  let currency = 'INR';
  for (const p of component.prices) {
    const v = p.price ?? p.currentPrice ?? Infinity;
    if (v < lowest) { lowest = v; currency = p.currency ?? 'INR'; }
  }
  return lowest === Infinity ? null : { price: lowest, currency };
}

// ── Live Featured Component Card ─────────────────────────────────────

function FeaturedCard({ component }: { component: ComponentDetail }) {
  const navigate = useNavigate();
  const lowestOffer = getLowestPrice(component);
  const catColor = CATEGORY_COLORS[component.category] ?? 'bg-slate-50 text-slate-700 border-slate-200';
  const icon = CATEGORY_ICONS[component.category] ?? '📦';
  const storeCount = component.prices?.filter((p) => p.productUrl).length ?? 0;

  return (
    <div
      className="group flex flex-col rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg cursor-pointer overflow-hidden"
      onClick={() => navigate(`/components/${component._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/components/${component._id}`)}
    >
      {/* Image */}
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 overflow-hidden">
        {component.images && component.images[0] ? (
          <img
            src={component.images[0]}
            alt={component.name}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              const parent = el.parentElement;
              if (parent) {
                const span = document.createElement('span');
                span.textContent = icon;
                span.className = 'text-5xl select-none';
                parent.appendChild(span);
              }
            }}
          />
        ) : (
          <span className="text-5xl select-none filter drop-shadow">{icon}</span>
        )}
        {/* Store count badge */}
        {storeCount > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm">
            {storeCount} store{storeCount !== 1 ? 's' : ''}
          </span>
        )}
        {/* In stock dot */}
        {component.stockStatus === 'In Stock' && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            In Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catColor}`}>
              {component.category}
            </span>
            {component.rating > 0 && (
              <span className="text-[10px] font-bold text-amber-500">{component.rating.toFixed(1)} ★</span>
            )}
          </div>
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug">
            {component.name}
          </h3>
          <p className="text-[11px] font-medium text-slate-500">{component.brand}</p>
        </div>

        <div className="border-t border-slate-50 pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Lowest price</p>
            {lowestOffer ? (
              <p className="text-base font-extrabold text-slate-900">
                {formatPrice(lowestOffer.price, lowestOffer.currency)}
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-400 italic">Price N/A</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-bold text-white transition group-hover:bg-violet-600 group-hover:shadow-md">
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
  const icon = CATEGORY_ICONS[component.category] ?? '📦';

  return (
    <div
      className="group border border-slate-100 rounded-3xl p-4 hover:shadow-md transition-all flex flex-col bg-white cursor-pointer hover:border-violet-200"
      onClick={() => navigate(`/components/${component._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/components/${component._id}`)}
    >
      {/* Image area */}
      <div className="h-36 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/50 rounded-2xl flex items-center justify-center p-3 mb-4 overflow-hidden group-hover:scale-[1.02] transition">
        {component.images && component.images[0] ? (
          <img
            src={component.images[0]}
            alt={component.name}
            className="h-full w-full object-contain"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
            }}
          />
        ) : (
          <span className="text-4xl select-none filter drop-shadow">{icon}</span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
              {component.category}
            </span>
            {component.rating > 0 && (
              <span className="text-[10px] font-bold text-amber-500">{component.rating.toFixed(1)} ★</span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-xs line-clamp-2 min-h-[32px] leading-tight mt-1.5">
            {component.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{component.brand}</p>
        </div>

        <div className="pt-2 border-t border-slate-50 space-y-2">
          {lowestOffer ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-slate-950">
                {formatPrice(lowestOffer.price, lowestOffer.currency)}
              </span>
              <span className="text-[10px] text-slate-400">
                {(component.prices?.length ?? 0) > 1
                  ? `across ${component.prices.length} stores`
                  : 'best price'}
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Price unavailable</p>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/components/${component._id}`); }}
            className="w-full py-2 rounded-full bg-slate-950 text-[11px] font-bold text-white transition hover:bg-violet-600 shadow-sm"
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
        <div key={i} className="animate-pulse rounded-3xl border border-slate-100 bg-white overflow-hidden">
          <div className={`bg-slate-100 ${tall ? 'h-44' : 'h-36'}`} />
          <div className="p-4 space-y-2">
            <div className="h-3 w-16 rounded-full bg-slate-100" />
            <div className="h-4 w-3/4 rounded-full bg-slate-200" />
            <div className="h-3 w-1/2 rounded-full bg-slate-100" />
            <div className="mt-3 h-5 w-24 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Category strip data ───────────────────────────────────────────────

const categoryStrip = [
  { label: 'CPU', tag: 'Processors' },
  { label: 'GPU', tag: 'Graphics' },
  { label: 'RAM', tag: 'Memory' },
  { label: 'Motherboard', tag: 'Boards' },
  { label: 'SSD', tag: 'Storage' },
  { label: 'PSU', tag: 'Power Supplies' },
  { label: 'Cooler', tag: 'Cooling' },
  { label: 'Cabinet', tag: 'Cases' },
];

// ── Main LandingPage ──────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
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

  useEffect(() => { loadFeatured(); }, [loadFeatured]);

  // Filtered by active category tab
  const filtered = activeTab === 'All'
    ? featured
    : featured.filter((c) => c.category === activeTab);

  // Carousel slides
  const slides = [
    {
      title: 'Build with AI Compatibility',
      desc: 'Pick your parts and let our AI check connectors, memory speeds, and power draw instantly.',
      btnText: 'Start Building PC',
      action: () => navigate('/builder'),
      bg: 'from-blue-600 via-indigo-700 to-violet-800',
    },
    {
      title: 'Compare Live Prices Instantly',
      desc: 'Real prices scraped from MDComputers, PrimeABGB, and Vedant — always up to date.',
      btnText: 'Search Components',
      action: () => navigate('/search'),
      bg: 'from-slate-900 via-slate-800 to-indigo-900',
    },
    {
      title: 'Authenticity Guarantee',
      desc: 'All parts sourced directly from licensed vendors with full manufacturer warranty.',
      btnText: 'Ask AI Assistant',
      action: () => navigate('/ai'),
      bg: 'from-violet-800 via-purple-700 to-pink-600',
    },
  ];

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

  // Auto-advance carousel
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="space-y-8 pb-10">

      {/* 1. Category Strip */}
      <section className="bg-white border border-slate-200/80 rounded-[1.5rem] py-4 px-6 shadow-sm overflow-x-auto scrollbar-none flex justify-between gap-6 md:gap-4 min-w-full">
        {categoryStrip.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(cat.label)}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 group transition ${
              activeTab === cat.label ? 'text-violet-600 scale-105' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl shadow-sm transition ${
              activeTab === cat.label
                ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500/20'
                : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100'
            }`}>
              {CATEGORY_ICONS[cat.label] ?? cat.label.charAt(0)}
            </div>
            <span className="text-xs font-semibold tracking-wide whitespace-nowrap">{cat.label}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('All')}
          className={`flex flex-col items-center gap-1.5 flex-shrink-0 transition ${
            activeTab === 'All' ? 'text-violet-600 scale-105' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition ${
            activeTab === 'All'
              ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500/20'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}>
            All
          </div>
          <span className="text-xs font-semibold tracking-wide">Show All</span>
        </button>
      </section>

      {/* 2. Hero Carousel */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white min-h-[260px] flex items-center shadow-lg">
        <div className="absolute inset-0 w-full h-full">
          {slides.map((slide, idx) => (
            <div
              key={slide.title}
              className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-opacity duration-700 ease-in-out px-8 py-10 sm:px-14 sm:py-12 flex flex-col justify-center ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="max-w-2xl space-y-4">
                <span className="bg-white/10 backdrop-blur-sm border border-white/10 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-200">
                  Featured
                </span>
                <h1 className="text-3xl font-extrabold sm:text-4xl leading-tight tracking-tight">{slide.title}</h1>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">{slide.desc}</p>
                <div className="pt-2">
                  <button
                    onClick={slide.action}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-xs font-bold hover:bg-slate-100 shadow-md transition hover:scale-105 active:scale-95"
                  >
                    {slide.btnText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)}
          className="absolute left-4 z-20 p-2.5 rounded-full bg-slate-950/20 text-white hover:bg-slate-950/40 backdrop-blur-sm transition border border-white/10"
        >
          <HiChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)}
          className="absolute right-4 z-20 p-2.5 rounded-full bg-slate-950/20 text-white hover:bg-slate-950/40 backdrop-blur-sm transition border border-white/10"
        >
          <HiChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-2.5 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* 3. Deals of the Day — LIVE DATA */}
      <section className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Deals of the Day</h2>
            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-100">
              <HiClock className="h-4 w-4 animate-pulse" />
              <span>
                {timeLeft.hours.toString().padStart(2, '0')}:
                {timeLeft.minutes.toString().padStart(2, '0')}:
                {timeLeft.seconds.toString().padStart(2, '0')} Left
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadFeatured}
              title="Refresh components"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition"
            >
              <HiOutlineRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link to="/components" className="text-xs font-bold text-violet-600 hover:text-violet-500 transition">
              View All →
            </Link>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
            <HiOutlineExclamationCircle className="mx-auto h-8 w-8 text-rose-400" />
            <p className="mt-3 text-sm font-semibold text-rose-700">{loadError}</p>
            <button
              onClick={loadFeatured}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition"
            >
              <HiOutlineRefresh className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? <GridSkeleton count={4} />
              : featured.slice(0, 4).map((c) => <DealCard key={c._id} component={c} />)
            }
          </div>
        )}
      </section>

      {/* 4. Secondary promo banners */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 text-white p-8 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-100">
              Interactive Builder
            </div>
            <h3 className="text-2xl font-bold">Build Your Custom PC</h3>
            <p className="text-slate-100 text-xs leading-relaxed max-w-sm">
              Combine components from your cart or catalog to configure your setup with live compatibility checks.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => navigate('/builder')}
              className="rounded-full bg-white text-violet-600 px-6 py-2.5 text-xs font-bold hover:bg-slate-50 transition"
            >
              Start Assembly
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 text-slate-50 text-9xl font-bold select-none">AI</div>
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-violet-600">
              AI Intelligent Matching
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Ask the AI Assistant</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              Not sure which component fits your budget? Explain your use case and get a build sheet in seconds.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => navigate('/ai')}
              className="rounded-full bg-slate-950 text-white px-6 py-2.5 text-xs font-bold hover:bg-slate-800 transition"
            >
              Consult AI
            </button>
          </div>
        </div>
      </section>

      {/* 5. Shop by Component — LIVE DATA with category filter */}
      <section className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Shop by Component</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isLoading ? 'Loading live prices…' : `${featured.length} components with live prices from multiple stores`}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {['All', 'CPU', 'GPU', 'RAM', 'Motherboard', 'SSD', 'PSU', 'Cooler', 'Cabinet'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 ${
                  activeTab === tab
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'All Products' : tab}
              </button>
            ))}
          </div>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-400 text-sm">
            {loadError}
          </div>
        ) : isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <GridSkeleton count={8} tall />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm font-semibold text-slate-600">No {activeTab !== 'All' ? activeTab : ''} components in the catalog yet.</p>
            <p className="mt-1 text-xs text-slate-400">Add components via the admin panel, or try a different category.</p>
            <Link to="/components" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline">
              Browse catalog <HiOutlineArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => <FeaturedCard key={c._id} component={c} />)}
          </div>
        )}
      </section>

      {/* 6. Trust badges */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl flex-shrink-0">
            <HiLightningBolt className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-sm">Free & Insured Delivery</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Every component ships in multi-layer shockproof packaging, fully insured for damage or loss.
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl flex-shrink-0">
            <HiShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-sm">Real-time Compatibility Safety</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              We validate clearances, power headers, and slot counts before you finalise your build.
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl flex-shrink-0">
            <HiTrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-sm">Real-time Price Engine</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Live prices scraped from MDComputers, PrimeABGB, and Vedant — always the cheapest deal.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
