import type { BuildStep } from '../../types/builder';

interface BuildStepperProps {
  steps: BuildStep[];
  activeIndex: number;
  onSelectStep: (index: number) => void;
}

export default function BuildStepper({ steps, activeIndex, onSelectStep }: BuildStepperProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Build progress</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Custom PC Builder</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Step {activeIndex + 1} of {steps.length}
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={step.category}
              type="button"
              onClick={() => onSelectStep(index)}
              className={`flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left transition ${
                isActive
                  ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">{step.category}</p>
                <p className="mt-1 text-base text-slate-600">{step.title}</p>
              </div>
              <span className="text-sm font-semibold text-slate-500">{step.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
