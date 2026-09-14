import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-[1536px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-slate-100">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="8" y="8" width="8" height="8" rx="1" className="fill-cyan-400/20 stroke-cyan-400" />
                </svg>
              </div>
              <span className="font-mono text-sm font-bold tracking-tight text-slate-800">PC<span className="text-slate-950 font-extrabold">FORGE</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Precision PC component catalog and live price arbitrage engine for Indian builders. Automated socket verification and wattage telemetry.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Scrapers Operational (5/5)
            </div>
          </div>

          {/* Builder Tools */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Builder Tools</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/builder" className="hover:text-slate-950 transition">
                  Interactive PC Builder
                </Link>
              </li>
              <li>
                <Link to="/components" className="hover:text-slate-950 transition">
                  Component Catalog
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-slate-950 transition">
                  Live Price Comparison
                </Link>
              </li>
              <li>
                <Link to="/ai" className="hover:text-slate-950 transition">
                  AI Hardware Consultant
                </Link>
              </li>
            </ul>
          </div>

          {/* Monitored Retailers */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Monitored Retailers</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>MDComputers India</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>PrimeABGB Mumbai</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Vedant Computers Kolkata</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Clarion Computers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>EliteHubs</span>
              </li>
            </ul>
          </div>

          {/* Architecture & Specs */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Hardware Telemetry</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time socket checks for AM5, AM4, LGA1700, and LGA1851. Dynamic TDP power draw calculation and recommended PSU headroom metrics.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              PRICING SYNC: 15-MIN INTERVALS
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PCForge. All manufacturer trademarks belong to their respective owners.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">Live Status</span>
            <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">Affiliate Transparency</span>
            <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">Terms of Service</span>
            <span className="text-slate-400 hover:text-slate-600 transition cursor-pointer">Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

