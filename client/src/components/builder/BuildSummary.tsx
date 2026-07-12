import type { SelectedComponent } from '../../types/builder';

interface BuildSummaryProps {
  selectedComponents: SelectedComponent[];
  onSaveBuild: () => void;
  onAskAI: () => void;
}

export default function BuildSummary({ selectedComponents, onSaveBuild, onAskAI }: BuildSummaryProps) {
  const totalPrice = selectedComponents.reduce((sum, item) => sum + (item.option?.price ?? 0), 0);
  const totalPower = selectedComponents.reduce((sum, item) => sum + (item.option?.powerWatts ?? 0), 0);
  const completed = selectedComponents.every((item) => item.option !== null);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Build summary</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">Your current configuration</h3>
      </div>

      <div className="grid gap-4 rounded-3xl bg-slate-50 p-6 text-slate-700">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500">Estimated total</span>
          <span className="text-lg font-semibold text-slate-900">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500">Estimated power draw</span>
          <span className="text-lg font-semibold text-slate-900">{totalPower}W</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500">Build completion</span>
          <span className="font-semibold text-slate-900">{completed ? 'Ready to save' : 'Select all parts'}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSaveBuild}
          disabled={!completed}
          className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Build
        </button>
        <button
          type="button"
          onClick={onAskAI}
          className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Ask AI
        </button>
      </div>
    </div>
  );
}
