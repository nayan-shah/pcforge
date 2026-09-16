import { useState } from 'react';
import {
  HiOutlineCpuChip,
  HiOutlineBolt,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import type { ComponentDetail } from '../../types/component';
import { resolveSpecifications } from '../../utils/specs';
import CategoryIcon from '../common/CategoryIcon';

interface SpecificationsTableProps {
  component: ComponentDetail;
}

export default function SpecificationsTable({ component }: SpecificationsTableProps) {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Resolve specifications: merges explicit DB specs with smart inferred specs
  const resolved = resolveSpecifications(component);
  const specEntries = Object.entries(resolved.flatSpecs);

  const handleCopySpecs = () => {
    if (!navigator.clipboard) return;
    const text = specEntries
      .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(`${component.name}\n${'='.repeat(component.name.length)}\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. High-Impact Key Specification Hero Cards ──────────── */}
      {resolved.keyBadges.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                <HiOutlineSparkles className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">
                  Key Hardware Highlights
                </h3>
                <p className="text-xs text-slate-500">Core architectural parameters at a glance</p>
              </div>
            </div>
            <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              Category: {component.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {resolved.keyBadges.map((badge, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-slate-100/40 p-3.5 transition-all duration-200 hover:border-slate-300 hover:shadow-xs"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {badge.label}
                </span>
                <p className="mt-1 font-mono text-sm sm:text-base font-extrabold text-slate-950 truncate" title={badge.value}>
                  {badge.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. Full Technical Specifications Table ────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50 to-slate-100/60 px-6 py-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <HiOutlineCpuChip className="h-5 w-5 text-slate-700" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                Full Technical Specifications
              </h3>
              <p className="text-xs text-slate-500">
                Detailed hardware specifications and verified interface protocols
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySpecs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
              title="Copy specifications to clipboard"
            >
              {copied ? (
                <>
                  <HiOutlineCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <HiOutlineClipboardDocument className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Specs</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              title="Toggle raw specifications JSON"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Technical Data Grid */}
        <div className="divide-y divide-slate-100 px-6">
          {specEntries.length > 0 ? (
            specEntries.map(([key, value]) => {
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();

              return (
                <div
                  key={key}
                  className="flex flex-col py-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-lg"
                >
                  <span className="text-xs font-medium text-slate-600 sm:w-1/3">
                    {formattedKey}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-950 sm:w-2/3 sm:text-right mt-0.5 sm:mt-0 break-words">
                    {String(value)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No technical specifications recorded yet for this component.
            </div>
          )}
        </div>

        {/* Optional JSON Inspection drawer */}
        {showRawJson && (
          <div className="border-t border-slate-800 bg-slate-950 p-4 text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase">
              <span>Raw Specifications Document</span>
              <span className="text-cyan-400">{specEntries.length} properties</span>
            </div>
            <pre className="mt-2 max-h-48 overflow-auto font-mono text-[11px] text-cyan-300">
              {JSON.stringify(resolved.flatSpecs, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* ── 3. System Compatibility & Hardware Guidelines ───────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <HiOutlineShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">
              Compatibility &amp; System Integration
            </h3>
            <p className="text-xs text-slate-500">
              Automated rules utilized by PCForge Builder engine
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {resolved.compatibility.socket && (
            <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Socket Compatibility
              </span>
              <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-slate-900">
                {resolved.compatibility.socket}
              </p>
            </div>
          )}

          {resolved.compatibility.formFactor && (
            <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Form Factor / Clearance
              </span>
              <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-slate-900">
                {resolved.compatibility.formFactor}
              </p>
            </div>
          )}

          {resolved.compatibility.tdp && (
            <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estimated Thermal Power (TDP)
              </span>
              <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-amber-700">
                {resolved.compatibility.tdp} Watts
              </p>
            </div>
          )}

          {resolved.compatibility.recommendedPsu && (
            <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recommended Power Supply
              </span>
              <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-emerald-700">
                {resolved.compatibility.recommendedPsu}W Minimum
              </p>
            </div>
          )}
        </div>

        {resolved.compatibility.notes.length > 0 && (
          <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <HiOutlineInformationCircle className="h-4 w-4 text-cyan-600" />
              <span>Compatibility Guidelines</span>
            </div>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-xs text-slate-600">
              {resolved.compatibility.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
