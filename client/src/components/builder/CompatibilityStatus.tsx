import type { SelectedComponent } from '../../types/builder';

interface CompatibilityStatusProps {
  selectedComponents: SelectedComponent[];
}

export default function CompatibilityStatus({ selectedComponents }: CompatibilityStatusProps) {
  const missing = selectedComponents.filter((item) => item.option === null);
  const warnings = selectedComponents.flatMap((item) => item.option?.compatibilityNotes ?? []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Compatibility status</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Check your build for issues</h3>
      </div>

      {missing.length > 0 ? (
        <div className="rounded-3xl bg-slate-50 p-5 text-slate-600">
          Select all required components to see compatibility guidance.
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.length > 0 ? (
            <div className="space-y-3 rounded-3xl bg-amber-50 p-5 text-amber-900">
              <p className="font-semibold">Potential compatibility warnings</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-amber-900">
                {warnings.map((note, index) => (
                  <li key={`${note}-${index}`}>{note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-900">
              <p className="font-semibold">Compatibility looks good.</p>
              <p className="mt-2 text-sm text-emerald-900/80">Your selected components appear compatible based on their compatibility notes.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
