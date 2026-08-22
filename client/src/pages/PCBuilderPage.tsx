import { useEffect, useMemo, useState } from 'react';
import { HiCheckCircle, HiChevronRight } from 'react-icons/hi2';
import { createBuild } from '../api/buildApi';
import { getComponents } from '../api/componentApi';
import { useAuth } from '../context/AuthContext';
import { useBuilder } from '../context/BuilderContext';
import type { BuildStep, BuilderOption, ComponentCategory, SelectedComponent } from '../types/builder';
import type { ComponentDetail } from '../types/component';
import ComponentSelector from '../components/builder/ComponentSelector';
import BuildSummary from '../components/builder/BuildSummary';

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

  const completedCategories = useMemo(() => {
    return {
      CPU: !!selections.cpu,
      GPU: !!selections.gpu,
      RAM: !!selections.ram,
      Motherboard: !!selections.motherboard,
      PSU: !!selections.psu,
      Storage: !!selections.storage,
      Case: !!selections.case,
      Cooler: !!selections.cooler,
    };
  }, [selections]);

  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">PC Builder</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">Required components</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Choose every core part for a complete PC.</p>
            </div>

            <div className="mt-4 space-y-1">
              {buildSteps.map((step, index) => {
                const isSelected = completedCategories[step.category];
                const isActive = index === activeStepIndex;

                return (
                  <button
                    key={step.category}
                    type="button"
                    onClick={() => handleSelectStep(index)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      isActive
                        ? 'bg-violet-50 text-violet-900 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-800'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSelected ? (
                      <HiCheckCircle className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Selected" />
                    ) : (
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${isActive ? 'border-violet-500 text-violet-600' : 'border-slate-300 text-slate-400 dark:border-slate-600'}`}>
                        {index + 1}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{step.category}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {isSelected ? 'Component selected' : 'Required'}
                      </span>
                    </span>
                    <HiChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
        
        <div className="space-y-6">
          <ComponentSelector
            category={activeCategory}
            options={availableOptions}
            selectedId={selectedOption?.id ?? null}
            loading={isLoadingOptions}
            onSelect={handleSelectOption}
          />
          <BuildSummary
            selectedComponents={selectedComponents}
            onSaveBuild={handleSaveBuild}
            onAskAI={handleAskAI}
          />
        </div>
      </div>
    </section>
  );
}
