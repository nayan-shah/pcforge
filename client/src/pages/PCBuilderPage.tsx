import { useEffect, useMemo, useState } from 'react';
import { createBuild } from '../api/buildApi';
import { getComponents } from '../api/componentApi';
import { useAuth } from '../context/AuthContext';
import { useBuilder } from '../context/BuilderContext';
import type { BuildStep, BuilderOption, ComponentCategory, SelectedComponent } from '../types/builder';
import type { ComponentDetail } from '../types/component';
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

const builderToBackendCategoryMap: Record<ComponentCategory, string[]> = {
  CPU: ['CPU'],
  GPU: ['GPU'],
  RAM: ['RAM'],
  Motherboard: ['Motherboard'],
  PSU: ['PSU'],
  Storage: ['SSD', 'HDD'],
  Case: ['Cabinet'],
  Cooler: ['Cooler'],
};

const selectionKeyMap: Record<ComponentCategory, 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case' | 'cooler'> = {
  CPU: 'cpu',
  Motherboard: 'motherboard',
  RAM: 'ram',
  GPU: 'gpu',
  Storage: 'storage',
  PSU: 'psu',
  Case: 'case',
  Cooler: 'cooler',
};

const toCompatibilityNotes = (component: ComponentDetail): string[] => {
  const notes = Array.isArray(component.compatibility?.notes)
    ? component.compatibility.notes.map((note) => String(note))
    : [];

  if (notes.length > 0) {
    return notes;
  }

  const summary = component.compatibility && typeof component.compatibility === 'object'
    ? Object.values(component.compatibility).map((value) => String(value)).filter(Boolean)
    : [];

  return summary.slice(0, 3);
};

const mapComponentToBuilderOption = (component: ComponentDetail): BuilderOption => {
  const lowestPrice = component.prices?.length
    ? component.prices.reduce((min, offer) => Math.min(min, Number(offer.currentPrice ?? 0)), Number.POSITIVE_INFINITY)
    : 0;

  const powerFromSpecifications = Number(
    component.specifications?.powerConsumption ??
    component.specifications?.TDP ??
    component.specifications?.maxPowerDraw ??
    component.specifications?.power ??
    0,
  );

  const categoryMap: Record<string, ComponentCategory> = {
    CPU: 'CPU',
    GPU: 'GPU',
    RAM: 'RAM',
    Motherboard: 'Motherboard',
    PSU: 'PSU',
    SSD: 'Storage',
    HDD: 'Storage',
    Cabinet: 'Case',
    Cooler: 'Cooler',
  } as const;

  return {
    id: component._id,
    name: component.name,
    brand: component.brand,
    price: Number.isFinite(lowestPrice) ? lowestPrice : 0,
    powerWatts: Number.isFinite(powerFromSpecifications) ? powerFromSpecifications : 0,
    description: component.description || 'No further details available.',
    category: categoryMap[component.category] ?? 'CPU',
    compatibilityNotes: toCompatibilityNotes(component),
  };
};

export default function PCBuilderPage() {
  const { isAuthenticated, user } = useAuth();
  const { selections, selectedComponents, setSelection, clearBuild, totalPrice, totalPower } = useBuilder();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<BuilderOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const activeCategory = buildSteps[activeStepIndex].category;

  useEffect(() => {
    let ignore = false;

    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        const categories = builderToBackendCategoryMap[activeCategory];
        const requests = categories.map((category) => getComponents({ category, limit: 20 }));
        const results = await Promise.all(requests);
        const merged = results.flatMap((result) => result.components.map((component) => mapComponentToBuilderOption(component)));

        if (!ignore) {
          setAvailableOptions(merged.filter((option) => option.category === activeCategory));
        }
      } catch (error) {
        if (!ignore) {
          setAvailableOptions([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadOptions();
    return () => {
      ignore = true;
    };
  }, [activeCategory]);

  const selectedOption = selections[selectionKeyMap[activeCategory]];

  function handleSelectOption(option: BuilderOption) {
    setSelection(selectionKeyMap[option.category], option);
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

  async function handleSaveBuild() {
    if (!isAuthenticated) {
      alert('Please log in to save your build.');
      return;
    }

    if (selectedComponents.some((item) => item.option === null)) {
      alert('Please finish selecting all required build parts before saving.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: `${user?.name ?? 'My'} Build`,
        components: selectedComponents.map((item) => ({
          componentId: item.option!.id,
          category: item.category,
          name: item.option!.name,
          brand: item.option!.brand,
          price: item.option!.price,
          powerWatts: item.option!.powerWatts,
          image: item.option!.description || '',
        })),
        totalPrice,
        totalPower,
      };

      await createBuild(payload);
      alert('Build saved successfully.');
      clearBuild();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save build.';
      alert(message);
    } finally {
      setLoading(false);
    }
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
            loading={loading || isLoadingOptions}
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
              <p>Selected parts are now backed by live catalog data from the API.</p>
              <p>Current estimated totals: ₹{totalPrice.toFixed(2)} · {totalPower}W</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
