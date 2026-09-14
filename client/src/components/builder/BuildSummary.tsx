import { useState } from 'react';
import type { SelectedComponent } from '../../types/builder';
import { formatPrice } from '../../utils/formatters';
import { HiOutlineBolt, HiOutlineCheckCircle, HiOutlineSparkles, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

interface BuildSummaryProps {
  selectedComponents: SelectedComponent[];
  onSaveBuild: () => void;
  onAskAI: () => void;
}

export default function BuildSummary({
  selectedComponents,
  onSaveBuild,
  onAskAI,
}: BuildSummaryProps) {
  const [copied, setCopied] = useState(false);

  const totalPrice = selectedComponents.reduce((sum, item) => sum + (item.option?.price ?? 0), 0);
  const totalPower = selectedComponents.reduce(
    (sum, item) => sum + (item.option?.powerWatts ?? 0),
    0,
  );
  const completedCount = selectedComponents.filter((item) => item.option !== null).length;
  const totalCount = selectedComponents.length;
  const completed = completedCount === totalCount && totalCount > 0;

  // Enthusiast PSU calculation: 35% headroom recommended for transient spikes
  const recommendedPsu = Math.max(500, Math.ceil(((totalPower || 250) * 1.35) / 50) * 50);
  const loadPercentage = Math.min(100, Math.round((totalPower / recommendedPsu) * 100));

  const handleCopyBuildSheet = () => {
    const lines = [
      '--- PCForge Custom Rig Sheet ---',
      ...selectedComponents.map((c) => `${c.category}: ${c.option ? `${c.option.name} (${formatPrice(c.option.price)})` : 'Not Selected'}`),
      `Total Estimated Draw: ${totalPower}W (Recommended PSU: ${recommendedPsu}W+)`,
      `Total Price: ${formatPrice(totalPrice)}`,
      'Configured via PCForge (pcforge.in)',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            TELEMETRY & BUDGET HUD
          </span>
          <h3 className="mt-1 text-base font-extrabold text-white tracking-tight">
            System Configuration
          </h3>
        </div>
        <span
          className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border ${
            completed
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {completed ? 'READY FOR ASSEMBLY' : `${completedCount}/${totalCount} PARTS`}
        </span>
      </div>

      {/* Pricing and Draw Display */}
      <div className="space-y-4 rounded-lg bg-slate-900/90 p-4 border border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Estimated Total (Best Live Retailer)
          </span>
          <p className="mt-1 font-mono text-2xl font-black text-white tracking-tight">
            {formatPrice(totalPrice)}
          </p>
        </div>

        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <HiOutlineBolt className="h-3.5 w-3.5 text-amber-400" />
              Calculated TDP Draw:
            </span>
            <span className="font-bold text-white">{totalPower}W</span>
          </div>

          {/* Wattage Headroom Bar */}
          <div className="mt-2 space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  loadPercentage > 85
                    ? 'bg-rose-500'
                    : loadPercentage > 60
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.max(5, loadPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0W</span>
              <span className="text-cyan-300 font-semibold">Recommended PSU: {recommendedPsu}W+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Component Checklist */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Component Checklist
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
          {selectedComponents.map((item) => {
            const hasOption = item.option !== null;
            return (
              <div
                key={item.category}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 border text-[11px] ${
                  hasOption
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasOption ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
                <span className="truncate">{item.category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onSaveBuild}
          disabled={!completed}
          className="w-full rounded-lg bg-cyan-500 py-3 text-xs font-bold font-mono text-slate-950 transition hover:bg-cyan-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
        >
          Save Build to Profile
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAskAI}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 py-2.5 text-xs font-semibold font-mono text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            <HiOutlineSparkles className="h-3.5 w-3.5 text-cyan-400" />
            Audit with AI
          </button>
          <button
            type="button"
            onClick={handleCopyBuildSheet}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 py-2.5 text-xs font-semibold font-mono text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            <HiOutlineClipboardDocumentCheck className="h-3.5 w-3.5 text-slate-400" />
            {copied ? 'Copied!' : 'Export Sheet'}
          </button>
        </div>
      </div>
    </div>
  );
}

