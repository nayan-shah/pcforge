import type { BuildStep } from '../../types/builder';

interface BuildStepperProps {
  steps: BuildStep[];
  activeIndex: number;
  onSelectStep: (index: number) => void;
  completedCategories: Record<string, boolean>;
}

export default function BuildStepper({ steps, activeIndex, onSelectStep, completedCategories }: BuildStepperProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Build progress</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Required Parts</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Step {activeIndex + 1} of {steps.length}
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = completedCategories[step.category];
          
          return (
            <button
              key={step.category}
              type="button"
              onClick={() => onSelectStep(index)}
              className={`flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left transition ${
                isActive
                  ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isActive ? 'border-violet-500 text-violet-600' : 'border-slate-300 text-slate-400'}`}>
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  </div>
                )}
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${isCompleted ? 'text-emerald-700' : ''}`}>{step.category}</p>
                  <p className={`mt-1 text-base ${isActive ? 'text-violet-800' : isCompleted ? 'text-emerald-800' : 'text-slate-600'}`}>{step.title}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold hidden md:block ${isActive ? 'text-violet-500' : isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>{step.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
