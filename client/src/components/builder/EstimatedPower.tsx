import type { SelectedComponent } from '../../types/builder';

interface EstimatedPowerProps {
  selectedComponents: SelectedComponent[];
}

export default function EstimatedPower({ selectedComponents }: EstimatedPowerProps) {
  const totalPower = selectedComponents.reduce((sum, item) => sum + (item.option?.powerWatts ?? 0), 0);
  const requiredPSU = Math.ceil(totalPower * 1.25 / 50) * 50;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Power estimate</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Estimated system load</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Current draw</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalPower}W</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Recommended PSU</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{requiredPSU}W</p>
        </div>
      </div>
    </div>
  );
}
