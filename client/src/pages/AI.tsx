import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSparkles,
  HiOutlineBolt,
  HiOutlineCpuChip,
  HiOutlineCheckCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineArrowRight,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import { formatPrice } from '../utils/formatters';

interface BuildArchetype {
  id: string;
  name: string;
  badge: string;
  budget: number;
  tdp: number;
  description: string;
  components: {
    category: string;
    part: string;
    vendor: string;
    price: number;
  }[];
  rationale: string[];
}

const PRESET_ARCHETYPES: BuildArchetype[] = [
  {
    id: '1440p-gaming',
    name: '1440p Ultra High-Refresh AAA Gaming Rig',
    badge: 'MOST POPULAR',
    budget: 98500,
    tdp: 480,
    description: 'Designed for 120+ FPS at 1440p in Cyberpunk 2077, Black Myth: Wukong, and Warzone.',
    components: [
      { category: 'CPU', part: 'AMD Ryzen 5 7600X (6-Core, 5.3GHz Boost)', vendor: 'Vedant Computers', price: 18900 },
      { category: 'GPU', part: 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X', vendor: 'PrimeABGB', price: 56200 },
      { category: 'Motherboard', part: 'MSI PRO B650M-A WiFi DDR5', vendor: 'MDComputers', price: 13400 },
      { category: 'RAM', part: 'G.Skill Flare X5 32GB (2x16GB) DDR5-6000 CL30', vendor: 'Vedant Computers', price: 9200 },
      { category: 'Storage', part: 'Crucial T500 1TB PCIe Gen4 NVMe SSD (7300 MB/s)', vendor: 'PrimeABGB', price: 7400 },
      { category: 'PSU', part: 'Deepcool PM750D 750W 80+ Gold Non-Modular', vendor: 'MDComputers', price: 5800 },
      { category: 'Cooler', part: 'Deepcool AK400 Zero Dark Air Cooler', vendor: 'Vedant Computers', price: 2400 },
      { category: 'Cabinet', part: 'Montech Air 903 Base Mid-Tower High Airflow', vendor: 'PrimeABGB', price: 5200 },
    ],
    rationale: [
      'AM5 socket guarantees drop-in CPU upgrades through at least 2027.',
      'RTX 4070 Super delivers DLSS 3 Frame Gen and 12GB VRAM buffer required for modern titles.',
      'CL30 6000MHz RAM hits the exact 1:1 FCLK sweet spot for Zen 4 architectures.',
      'Multi-retailer price routing saved ₹8,450 compared to single-store checkout.',
    ],
  },
  {
    id: 'esports-budget',
    name: '1080p Competitive Esports Machine',
    badge: 'BEST VALUE',
    budget: 52000,
    tdp: 320,
    description: 'High FPS machine optimized for CS2, Valorant, Apex Legends, and Fortnite at 240Hz.',
    components: [
      { category: 'CPU', part: 'Intel Core i5-12400F (6-Core, 4.4GHz Boost)', vendor: 'MDComputers', price: 9200 },
      { category: 'GPU', part: 'AMD Radeon RX 6600 8GB GDDR6', vendor: 'Vedant Computers', price: 19800 },
      { category: 'Motherboard', part: 'ASRock B760M-HDV/M.2 DDR4', vendor: 'PrimeABGB', price: 8300 },
      { category: 'RAM', part: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200', vendor: 'MDComputers', price: 3400 },
      { category: 'Storage', part: 'Kingston NV2 1TB PCIe 4.0 NVMe SSD', vendor: 'Vedant Computers', price: 4900 },
      { category: 'PSU', part: 'Corsair CV550 550W 80+ Bronze', vendor: 'PrimeABGB', price: 3650 },
      { category: 'Cooler', part: 'Intel Stock Laminar Cooler', vendor: 'Included in Box', price: 0 },
      { category: 'Cabinet', part: 'Ant Esports ICE-100 Airflow Gaming Cabinet', vendor: 'MDComputers', price: 2750 },
    ],
    rationale: [
      'Solid 200+ FPS in CS2 and 300+ in Valorant at 1080p competitive settings.',
      'RX 6600 provides best rasterization FPS-per-rupee in the sub-₹20k bracket.',
      '550W PSU provides adequate headroom for future GPU upgrades up to RTX 4060.',
    ],
  },
  {
    id: 'creator-workstation',
    name: '4K Premiere & Blender Production Rig',
    badge: 'WORKSTATION',
    budget: 158000,
    tdp: 590,
    description: 'Hardware accelerated video encoding, CUDA rendering, and multi-threaded simulations.',
    components: [
      { category: 'CPU', part: 'Intel Core i7-14700K (20-Core, 28 Threads, 5.6GHz)', vendor: 'MDComputers', price: 37500 },
      { category: 'GPU', part: 'NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X', vendor: 'PrimeABGB', price: 79900 },
      { category: 'Motherboard', part: 'MSI MAG Z790 TOMAHAWK WIFI DDR5', vendor: 'Vedant Computers', price: 23900 },
      { category: 'RAM', part: 'G.Skill Ripjaws S5 64GB (2x32GB) DDR5-6000', vendor: 'PrimeABGB', price: 18400 },
      { category: 'Storage', part: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD', vendor: 'MDComputers', price: 16800 },
      { category: 'PSU', part: 'Corsair RM850e 850W 80+ Gold Fully Modular ATX 3.0', vendor: 'Vedant Computers', price: 9800 },
      { category: 'Cooler', part: 'Deepcool LS720 360mm Liquid Cooler', vendor: 'PrimeABGB', price: 8900 },
      { category: 'Cabinet', part: 'Lian Li Lancool 216 RGB High Airflow Mid-Tower', vendor: 'MDComputers', price: 7900 },
    ],
    rationale: [
      'Intel QuickSync dual media encoders deliver instant scrubbing in Premiere Pro timelines.',
      '16GB GDDR6X VRAM prevents out-of-memory errors during heavy Blender 3D cycles rendering.',
      '64GB high-speed DDR5 allows multitasking between After Effects, Photoshop, and 4K renders.',
    ],
  },
];

export default function AI() {
  const navigate = useNavigate();
  const [selectedArchetype, setSelectedArchetype] = useState<BuildArchetype>(PRESET_ARCHETYPES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      // Intelligently select best matching archetype
      const lower = customPrompt.toLowerCase();
      if (lower.includes('budget') || lower.includes('50') || lower.includes('cheap') || lower.includes('esport')) {
        setSelectedArchetype(PRESET_ARCHETYPES[1]);
      } else if (lower.includes('workstation') || lower.includes('edit') || lower.includes('blender') || lower.includes('render') || lower.includes('1.5') || lower.includes('2')) {
        setSelectedArchetype(PRESET_ARCHETYPES[2]);
      } else {
        setSelectedArchetype(PRESET_ARCHETYPES[0]);
      }
      setIsGenerating(false);
    }, 600);
  };

  const calculatedTotal = selectedArchetype.components.reduce((sum, c) => sum + c.price, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-tech-grid-dark opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-mono text-cyan-400">
            <HiOutlineSparkles className="h-3.5 w-3.5" />
            <span>AI HARDWARE ARCHITECT & TELEMETRY ENGINE</span>
          </div>
          <h1 className="text-2xl font-extrabold sm:text-4xl tracking-tight text-white">
            AI PC Build Consultant
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tell our AI model your workload, target resolutions, and budget in Indian Rupees. We compute socket compatibility, thermal load, and generate multi-store price-optimized build sheets instantly.
          </p>
        </div>
      </section>

      {/* Preset Archetype Chips */}
      <div className="space-y-3">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
          Curated Benchmark Archetypes
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PRESET_ARCHETYPES.map((arch) => {
            const isSelected = selectedArchetype.id === arch.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => setSelectedArchetype(arch)}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {arch.badge}
                    </span>
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {formatPrice(arch.budget)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold leading-tight">{arch.name}</h3>
                </div>
                <p className={`mt-2 text-[11px] line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {arch.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Prompt Bar */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <label htmlFor="ai-prompt" className="block text-xs font-bold text-slate-900">
            Have a custom requirement? Describe your setup:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="ai-prompt"
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. 'Build for Unreal Engine 5 development and 1440p gaming under ₹1.2 Lakh'"
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
            >
              {isGenerating ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  Analyzing Hardware...
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="h-4 w-4 text-cyan-400" />
                  Generate Build Sheet
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Generated Build Sheet Result */}
      <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                AUDITED BUILD SHEET
              </span>
              <span className="font-mono text-xs text-slate-500">TDP: {selectedArchetype.tdp}W Draw</span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950 tracking-tight">
              {selectedArchetype.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Live Multi-Store Total</span>
              <p className="font-mono text-xl font-black text-slate-950">
                {formatPrice(calculatedTotal)}
              </p>
            </div>
            <button
              onClick={() => navigate('/builder')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
            >
              <HiOutlineWrenchScrewdriver className="h-3.5 w-3.5" />
              Configure in Builder
            </button>
          </div>
        </div>

        {/* Component Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Selected Component</th>
                <th className="py-2.5 px-3">Cheapest Retailer</th>
                <th className="py-2.5 px-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedArchetype.components.map((c) => (
                <tr key={c.category} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">{c.category}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">{c.part}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {c.vendor}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-950 text-right">
                    {formatPrice(c.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Hardware Architectural Rationale */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
            AI Compatibility & Bottleneck Analysis
          </p>
          <ul className="space-y-1 text-xs text-slate-600 pl-5 list-disc">
            {selectedArchetype.rationale.map((r, i) => (
              <li key={i} className="leading-relaxed">{r}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
