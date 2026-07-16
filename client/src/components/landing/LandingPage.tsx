import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiChevronLeft, 
  HiChevronRight, 
  HiChip, 
  HiTrendingUp, 
  HiShieldCheck, 
  HiClock,
  HiLightningBolt,
  HiCheck,
  HiShoppingCart
} from 'react-icons/hi';
import { useCart } from '../../context/CartContext';

// Helper to format currency in INR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// E-commerce items matching builder options
const productsData = [
  {
    id: 'cpu-1',
    name: 'AMD Ryzen 9 7950X',
    brand: 'AMD',
    category: 'CPU',
    price: 54999,
    originalPrice: 62999,
    rating: 4.8,
    badge: 'Top Choice',
    specs: '16 Cores, 32 Threads, 5.7GHz Boost',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'cpu-2',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    category: 'CPU',
    price: 49999,
    originalPrice: 58999,
    rating: 4.9,
    badge: 'Bestseller',
    specs: '24 Cores (8 P-Cores + 16 E-Cores), 6.0GHz',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'gpu-1',
    name: 'NVIDIA RTX 4090 Founders Edition',
    brand: 'NVIDIA',
    category: 'GPU',
    price: 159999,
    originalPrice: 179999,
    rating: 4.9,
    badge: 'Extreme Deal',
    specs: '24GB GDDR6X, Ada Lovelace, DLSS 3.0',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'ram-1',
    name: 'Corsair Vengeance DDR5 32GB (2x16GB)',
    brand: 'Corsair',
    category: 'RAM',
    price: 11999,
    originalPrice: 15499,
    rating: 4.7,
    badge: 'Value Pack',
    specs: '6000MHz, CL36, AMD EXPO / Intel XMP',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'motherboard-1',
    name: 'ASUS ROG Strix X670E-E Gaming WiFi',
    brand: 'ASUS',
    category: 'Motherboard',
    price: 39999,
    originalPrice: 46999,
    rating: 4.8,
    badge: 'Top Pick',
    specs: 'AM5, PCIe 5.0, 18+2 Power Stages, WiFi 6E',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'psu-1',
    name: 'Seasonic Focus GX-1000 1000W',
    brand: 'Seasonic',
    category: 'PSU',
    price: 15999,
    originalPrice: 18999,
    rating: 4.6,
    badge: '10 Years Warranty',
    specs: '80+ Gold, Fully Modular, Compact Size',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'storage-1',
    name: 'Samsung 990 Pro NVMe M.2 SSD 2TB',
    brand: 'Samsung',
    category: 'SSD',
    price: 14999,
    originalPrice: 19999,
    rating: 4.8,
    badge: 'Speed Demon',
    specs: 'Read speeds up to 7450 MB/s, V-NAND',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'case-1',
    name: 'Lian Li Lancool II Mesh RGB',
    brand: 'Lian Li',
    category: 'Cabinet',
    price: 11499,
    originalPrice: 13999,
    rating: 4.7,
    badge: 'Super Airflow',
    specs: 'Mid-Tower, 3x 120mm ARGB Fans, Tempered Glass',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
  {
    id: 'cooler-1',
    name: 'Noctua NH-D15 Dual-Tower Cooler',
    brand: 'Noctua',
    category: 'Cooler',
    price: 9499,
    originalPrice: 11499,
    rating: 4.8,
    badge: 'Silent Airflow',
    specs: 'Dual NF-A15 PWM Fans, SecuFirm2 system',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  },
];

const categoryStrip = [
  { label: 'CPU', tag: 'Processors' },
  { label: 'GPU', tag: 'Graphics' },
  { label: 'RAM', tag: 'Memory' },
  { label: 'Motherboard', tag: 'Boards' },
  { label: 'SSD', tag: 'Storage' },
  { label: 'PSU', tag: 'Power Supplies' },
  { label: 'Cooler', tag: 'Cooling Fans' },
  { label: 'Cabinet', tag: 'Cabinets / Cases' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { addToCart, isItemInCart, setIsCartDrawerOpen } = useCart();

  const [activeTab, setActiveTab] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  // Promotional Banners Carousel Content
  const slides = [
    {
      title: 'Build with AI Compatibility',
      desc: 'Pick your parts and let our AI check connectors, memory speeds, and power draw instantly.',
      btnText: 'Start Building PC',
      action: () => navigate('/builder'),
      bg: 'from-blue-600 via-indigo-700 to-violet-800',
    },
    {
      title: 'RTX 4090 Power Bundles',
      desc: 'Upgrade to extreme 4K gaming. Grab selected NVIDIA GPUs with complimentary high-speed DDR5 memory.',
      btnText: 'Shop Graphics Cards',
      action: () => setActiveTab('GPU'),
      bg: 'from-slate-900 via-slate-800 to-indigo-900',
    },
    {
      title: 'Authenticity Guarantee',
      desc: 'All parts sourced directly from licensed vendors (Vedant, MD Computers, PrimeABGB) with full warranty.',
      btnText: 'Ask AI Assistant',
      action: () => navigate('/ai'),
      bg: 'from-violet-800 via-purple-700 to-pink-600',
    },
  ];

  // Tick down timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Filter products for category listing
  const filteredProducts = activeTab === 'All' 
    ? productsData 
    : productsData.filter(p => p.category === activeTab);

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Flipkart-style Top Category Strip */}
      <section className="bg-white border border-slate-200/80 rounded-[1.5rem] py-4 px-6 shadow-sm overflow-x-auto scrollbar-none flex justify-between gap-6 md:gap-4 min-w-full">
        {categoryStrip.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(cat.label)}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 group transition ${
              activeTab === cat.label ? 'text-violet-600 scale-105' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm transition ${
              activeTab === cat.label 
                ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500/20' 
                : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100 group-hover:text-slate-800'
            }`}>
              {cat.label.charAt(0)}
            </div>
            <span className="text-xs font-semibold tracking-wide whitespace-nowrap">{cat.label}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('All')}
          className={`flex flex-col items-center gap-1.5 flex-shrink-0 group transition ${
            activeTab === 'All' ? 'text-violet-600 scale-105' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition ${
            activeTab === 'All' 
              ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500/20' 
              : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100 group-hover:text-slate-800'
          }`}>
            All
          </div>
          <span className="text-xs font-semibold tracking-wide whitespace-nowrap">Show All</span>
        </button>
      </section>

      {/* 2. Hero Promotional Carousel */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white min-h-[260px] flex items-center shadow-lg">
        {/* Carousel Slides */}
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
                  Featured Announcement
                </span>
                <h1 className="text-3xl font-extrabold sm:text-4xl leading-tight tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                  {slide.desc}
                </p>
                <div className="pt-2">
                  <button
                    onClick={slide.action}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-xs font-bold hover:bg-slate-100 shadow-md transition transform hover:scale-105 active:scale-95"
                  >
                    {slide.btnText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 z-20 p-2.5 rounded-full bg-slate-950/20 text-white hover:bg-slate-950/40 backdrop-blur-sm transition border border-white/10"
        >
          <HiChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 z-20 p-2.5 rounded-full bg-slate-950/20 text-white hover:bg-slate-950/40 backdrop-blur-sm transition border border-white/10"
        >
          <HiChevronRight className="h-5 w-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-white' : 'w-2.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 3. Flipkart-style Deals of the Day */}
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
          <button 
            onClick={() => setActiveTab('All')}
            className="text-xs font-bold text-violet-600 hover:text-violet-500 transition self-start sm:self-auto"
          >
            View All Components
          </button>
        </div>

        {/* Horizontal scrollable deals list */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productsData.slice(0, 4).map((product) => {
            const isInCart = isItemInCart(product.id);
            return (
              <div 
                key={product.id}
                className="group border border-slate-100 rounded-3xl p-5 hover:shadow-md transition relative flex flex-col bg-white"
              >
                {/* Product badge */}
                <span className="absolute top-4 left-4 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                  {product.badge}
                </span>

                {/* Simulated Product Visual */}
                <div className="h-40 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center justify-center p-4 mb-4 overflow-hidden group-hover:scale-[1.02] transition">
                  <span className="text-5xl select-none filter drop-shadow">
                    {product.category === 'CPU' ? '🎛️' : product.category === 'GPU' ? '📼' : product.category === 'RAM' ? '🐏' : '💿'}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">{product.rating} ★</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 min-h-[40px] leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold">{product.brand}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-slate-950">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="text-xs text-emerald-600 font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    </div>

                    <button
                      onClick={() => isInCart ? setIsCartDrawerOpen(true) : addToCart(product)}
                      className={`w-full py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isInCart
                          ? 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
                          : 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm'
                      }`}
                    >
                      {isInCart ? (
                        <>
                          <HiCheck className="h-4 w-4" />
                          Go to Cart
                        </>
                      ) : (
                        <>
                          <HiShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Secondary Promotions: Build Custom Banner */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 text-white p-8 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-100">
              Interactive Builder
            </div>
            <h3 className="text-2xl font-bold">Build Your Custom PC</h3>
            <p className="text-slate-100 text-xs leading-relaxed max-w-sm">
              Combine components from your cart or catalog to configure your setup with live compatibility checks and bottleneck estimations.
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
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 text-slate-50 text-9xl font-bold select-none opacity-5">
            AI
          </div>
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-violet-600">
              AI Intelligent matching
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Ask the AI Assistant</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              Not sure which component fits your budget? Explain your gaming or workloads to the AI and generate build sheets in seconds.
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

      {/* 5. Tabbed E-Commerce Component Section */}
      <section className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Shop by Component</h2>
            <p className="text-xs text-slate-500 mt-1">Browse individual parts, filter by type, and add them to your cart.</p>
          </div>
          {/* Horizontal scroll for tags */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {['All', 'CPU', 'GPU', 'RAM', 'Motherboard', 'SSD', 'PSU', 'Cooler', 'Cabinet'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 ${
                  activeTab === tab 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'All Products' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic products list grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isInCart = isItemInCart(product.id);
            return (
              <div 
                key={product.id}
                className="group border border-slate-100 rounded-3xl p-5 hover:shadow-md transition flex gap-4 bg-white items-center"
              >
                {/* Visual Thumbnail */}
                <div className="h-24 w-24 rounded-2xl bg-slate-50 border border-slate-100/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <span className="text-3xl select-none">
                    {product.category === 'CPU' ? '🎛️' : product.category === 'GPU' ? '📼' : product.category === 'RAM' ? '🐏' : product.category === 'Motherboard' ? '🧩' : '💿'}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">{product.rating} ★</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs truncate mt-1">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{product.specs}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-xs font-extrabold text-slate-950">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-[9px] text-slate-400 line-through leading-none">
                        {formatPrice(product.originalPrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => isInCart ? setIsCartDrawerOpen(true) : addToCart(product)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 ${
                        isInCart
                          ? 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
                          : 'bg-slate-950 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isInCart ? (
                        <>
                          <HiCheck className="h-3 w-3" />
                          Cart
                        </>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Brand trust / Guarantee values */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl flex-shrink-0">
            <HiLightningBolt className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-sm">Free & Insured Delivery</h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Every component is shipped in multi-layer shockproof padding, fully insured for damage or loss.
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
              We validate clearances, power headers, and slot counts so your configuration never runs into physical assembly issues.
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
              Compare actual live pricing metrics across popular distributors and stores to ensure you get the absolute cheapest price.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
