import { useMemo, useState } from 'react';
import type { BuildStep, BuilderOption, ComponentCategory, SelectedComponent } from '../types/builder';
import BuildStepper from '../components/builder/BuildStepper';
import ComponentSelector from '../components/builder/ComponentSelector';
import SelectedComponentCard from '../components/builder/SelectedComponentCard';
import BuildSummary from '../components/builder/BuildSummary';
import CompatibilityStatus from '../components/builder/CompatibilityStatus';
import EstimatedPower from '../components/builder/EstimatedPower';

const buildSteps: BuildStep[] = [
  { category: 'CPU', title: 'Choose your processor', description: 'Fast compute for gaming and productivity' },
  { category: 'GPU', title: 'Choose your graphics card', description: 'Powerful rendering and ray tracing' },
  { category: 'RAM', title: 'Choose your memory', description: 'Fast and stable system memory' },
  { category: 'Motherboard', title: 'Choose your mainboard', description: 'Reliable system foundation' },
  { category: 'PSU', title: 'Choose your power supply', description: 'Stable power for all components' },
  { category: 'Storage', title: 'Choose your storage', description: 'Fast boot and ample capacity' },
  { category: 'Case', title: 'Choose your chassis', description: 'Stylish and airflow-optimized enclosure' },
  { category: 'Cooler', title: 'Choose your cooling', description: 'Keep your system cool under load' },
];

const options: BuilderOption[] = [
  {
    id: 'cpu-1',
    category: 'CPU',
    name: 'AMD Ryzen 9 7950X',
    brand: 'AMD',
    price: 649.99,
    powerWatts: 170,
    description: '16 cores, 32 threads, excellent multi-core performance.',
    compatibilityNotes: ['Check motherboard socket compatibility'],
  },
  {
    id: 'cpu-2',
    category: 'CPU',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    price: 589.99,
    powerWatts: 125,
    description: 'High frequency performance for gaming and content creation.',
    compatibilityNotes: ['Check motherboard socket compatibility'],
  },
  {
    id: 'gpu-1',
    category: 'GPU',
    name: 'NVIDIA RTX 4090',
    brand: 'NVIDIA',
    price: 1599.99,
    powerWatts: 450,
    description: 'Top-tier graphics performance for 4K gaming.',
    compatibilityNotes: ['Requires a high-wattage PSU and sufficient case clearance'],
  },
  {
    id: 'ram-1',
    category: 'RAM',
    name: 'Corsair Vengeance DDR5 32GB',
    brand: 'Corsair',
    price: 199.99,
    powerWatts: 10,
    description: 'High-speed DDR5 memory for next-gen systems.',
    compatibilityNotes: ['Check motherboard RAM support'],
  },
  {
    id: 'motherboard-1',
    category: 'Motherboard',
    name: 'ASUS ROG Strix X670E',
    brand: 'ASUS',
    price: 449.99,
    powerWatts: 65,
    description: 'Premium AM5 motherboard with PCIe 5.0 and Wi-Fi 6E.',
    compatibilityNotes: ['Supports AMD Ryzen 7000 series processors'],
  },
  {
    id: 'psu-1',
    category: 'PSU',
    name: 'Seasonic Focus GX-1000',
    brand: 'Seasonic',
    price: 209.99,
    powerWatts: 1000,
    description: 'Reliable 80+ Gold power supply with modular cables.',
    compatibilityNotes: ['Suitable for high-end GPU builds'],
  },
  {
    id: 'storage-1',
    category: 'Storage',
    name: 'Samsung 990 Pro 2TB',
    brand: 'Samsung',
    price: 229.99,
    powerWatts: 6,
    description: 'High-performance NVMe SSD for fast boot and load times.',
    compatibilityNotes: ['Requires NVMe M.2 slot'],
  },
  {
    id: 'case-1',
    category: 'Case',
    name: 'Lian Li Lancool II',
    brand: 'Lian Li',
    price: 149.99,
    powerWatts: 0,
    description: 'Airflow-focused mid-tower chassis with tempered glass.',
    compatibilityNotes: ['Supports ATX motherboards and large GPUs'],
  },
  {
    id: 'cooler-1',
    category: 'Cooler',
    name: 'Noctua NH-D15',
    brand: 'Noctua',
    price: 109.99,
    powerWatts: 5,
    description: 'High-performance air cooler for quiet operation.',
    compatibilityNotes: ['Large cooler height may affect case compatibility'],
  },
];

const initialSelection: SelectedComponent[] = buildSteps.map((step) => ({
  category: step.category,
  option: null,
}));

export default function PCBuilderPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>(initialSelection);
  const [loading, setLoading] = useState(false);

  const activeCategory = buildSteps[activeStepIndex].category;
  const availableOptions = useMemo(
    () => options.filter((option) => option.category === activeCategory),
    [activeCategory]
  );

  const selectedOption = selectedComponents.find((item) => item.category === activeCategory)?.option ?? null;

  function handleSelectOption(option: BuilderOption) {
    setSelectedComponents((current) =>
      current.map((item) => (item.category === option.category ? { ...item, option } : item))
    );
  }

  function handleSelectStep(index: number) {
    setActiveStepIndex(index);
  }

  function goToNextStep() {
    setActiveStepIndex((current) => Math.min(current + 1, buildSteps.length - 1));
  }

  function goToPreviousStep() {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  function handleSaveBuild() {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }

  function handleAskAI() {
    alert('Ask AI is a UI-only feature.');
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <BuildStepper steps={buildSteps} activeIndex={activeStepIndex} onSelectStep={handleSelectStep} />

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Step {activeStepIndex + 1}</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Build your custom PC</h1>
            <p className="mt-4 text-slate-600">Select components step by step. Live pricing, power estimates, and compatibility checks update automatically.</p>
          </div>

          <ComponentSelector
            category={activeCategory}
            options={availableOptions}
            selectedId={selectedOption?.id ?? null}
            loading={loading}
            onSelect={handleSelectOption}
          />

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <BuildSummary selectedComponents={selectedComponents} onSaveBuild={handleSaveBuild} onAskAI={handleAskAI} />
              <CompatibilityStatus selectedComponents={selectedComponents} />
            </div>
            <EstimatedPower selectedComponents={selectedComponents} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={activeStepIndex === 0}
              className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              disabled={activeStepIndex === buildSteps.length - 1}
              className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Components selected</h2>
            <p className="mt-2 text-slate-600">Review your current choices before saving your build.</p>
            <div className="mt-6 grid gap-4">
              {selectedComponents.map((component) => (
                <SelectedComponentCard key={component.category} component={component} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Build details</h2>
            <div className="mt-5 space-y-3 text-slate-600">
              <p>Work through each step to create a complete, compatible PC build.</p>
              <p>The builder uses UI-only logic; no backend integration is implemented yet.</p>
              <p>The totals refresh instantly as you select parts.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
