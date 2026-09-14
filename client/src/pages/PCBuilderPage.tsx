import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiCheckCircle,
  HiChevronRight,
  HiArrowTopRightOnSquare,
  HiOutlineShoppingCart,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { createBuild } from '../api/buildApi';
import { getComponents } from '../api/componentApi';
import { useAuth } from '../context/AuthContext';
import { useBuilder } from '../context/BuilderContext';
import type {
  BuildStep,
  BuilderOption,
  ComponentCategory,
  SelectedComponent,
} from '../types/builder';
import type { ComponentDetail, PriceOffer } from '../types/component';
import ComponentSelector from '../components/builder/ComponentSelector';
import BuildSummary from '../components/builder/BuildSummary';
import CategoryIcon from '../components/common/CategoryIcon';
import { getLowestPrice } from '../utils/price';
import { formatPrice } from '../utils/formatters';

const buildSteps: BuildStep[] = [
  {
    category: 'CPU',
    title: 'Choose your processor',
    description: 'Fast compute for gaming and productivity',
  },
  {
    category: 'GPU',
    title: 'Choose your graphics card',
    description: 'Powerful rendering and ray tracing',
  },
  { category: 'RAM', title: 'Choose your memory', description: 'Fast and stable system memory' },
  {
    category: 'Motherboard',
    title: 'Choose your mainboard',
    description: 'Reliable system foundation',
  },
  {
    category: 'PSU',
    title: 'Choose your power supply',
    description: 'Stable power for all components',
  },
  {
    category: 'Storage',
    title: 'Choose your storage',
    description: 'Fast boot and ample capacity',
  },
  {
    category: 'Case',
    title: 'Choose your chassis',
    description: 'Stylish and airflow-optimized enclosure',
  },
  {
    category: 'Cooler',
    title: 'Choose your cooling',
    description: 'Keep your system cool under load',
  },
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

const selectionKeyMap: Record<
  ComponentCategory,
  'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case' | 'cooler'
> = {
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

  const summary =
    component.compatibility && typeof component.compatibility === 'object'
      ? Object.values(component.compatibility)
          .map((value) => String(value))
          .filter(Boolean)
      : [];

  return summary.slice(0, 3);
};

const mapComponentToBuilderOption = (component: ComponentDetail): BuilderOption => {
  const lowestPrice = getLowestPrice(component)?.price ?? 0;

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
    image: component.images?.[0] || '',
  };
};

/* -- Price Comparison panel (shown when a component is selected) ------ */
function PriceComparisonPanel({ component }: { component: ComponentDetail }) {
  const offers = [...(component.prices ?? [])]
    .map((p) => ({ ...p, sortPrice: p.price ?? p.currentPrice ?? Infinity }))
    .sort((a, b) => a.sortPrice - b.sortPrice);

  if (offers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <HiOutlineShoppingCart className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-xs font-semibold text-slate-600">No retailer offers found</p>
        <p className="mt-1 text-[11px] text-slate-400">Prices will appear once scraped from retailers.</p>
      </div>
    );
  }

  const cheapestPrice = offers[0].sortPrice;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            LIVE MARKET OFFERS
          </p>
          <h3 className="mt-1 text-sm font-bold text-slate-950 line-clamp-1">
            {component.name}
          </h3>
        </div>
        <span className="font-mono text-[10px] font-bold rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-700">
          {offers.length} STORE{offers.length !== 1 ? 'S' : ''} TRACKED
        </span>
      </div>

      <div className="space-y-2">
        {offers.map((offer, index) => {
          const isCheapest = offer.sortPrice === cheapestPrice;
          const isAvailable = offer.inStock !== false;
          return (
            <div
              key={`${offer.storeName}-${offer.productUrl}-${index}`}
              className={`flex items-center gap-4 rounded-xl border p-3.5 transition-all ${
                isCheapest
                  ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Store + Availability */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">{offer.storeName}</p>
                  {isCheapest && (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                      CHEAPEST
                    </span>
                  )}
                </div>
                <p className={`text-[11px] font-medium mt-0.5 ${
                  isAvailable ? 'text-emerald-700' : 'text-rose-500'
                }`}>
                  {isAvailable ? (offer.availability || 'In Stock') : 'Out of Stock'}
                </p>
              </div>

              {/* Price */}
              <p
                className={`font-mono text-sm font-extrabold tabular-nums ${
                  isCheapest ? 'text-emerald-800' : 'text-slate-950'
                }`}
              >
                {formatPrice(offer.sortPrice, offer.currency ?? 'INR')}
              </p>

              {/* Buy link */}
              {offer.productUrl && (
                <a
                  href={offer.productUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    isCheapest
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Buy
                  <HiArrowTopRightOnSquare className="h-3 w-3" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {cheapestPrice < Infinity && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-mono">
          <span className="text-emerald-800 font-medium">
            Best live offer: {offers[0].storeName}
          </span>
          <span className="font-bold text-emerald-900">
            {formatPrice(cheapestPrice, offers[0].currency ?? 'INR')}
          </span>
        </div>
      )}
    </div>
  );
}


export default function PCBuilderPage() {
  const { isAuthenticated, user } = useAuth();
  const { selections, selectedComponents, setSelection, removeSelection, clearBuild, totalPrice, totalPower } =
    useBuilder();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [availableOptions, setAvailableOptions] = useState<BuilderOption[]>([]);
  const [componentMap, setComponentMap] = useState<Record<string, ComponentDetail>>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const activeCategory = buildSteps[activeStepIndex].category;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    let ignore = false;

    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        const categories = builderToBackendCategoryMap[activeCategory];
        const requests = categories.map((category) =>
          getComponents({ category, limit: 20, search: debouncedSearch }),
        );
        const results = await Promise.all(requests);
        const allComponents = results.flatMap((result) => result.components);
        const merged = allComponents.map((component) => mapComponentToBuilderOption(component));

        // Build a lookup map from component ID → full ComponentDetail
        const map: Record<string, ComponentDetail> = {};
        for (const comp of allComponents) {
          map[comp._id] = comp;
        }

        if (!ignore) {
          setAvailableOptions(merged.filter((option) => option.category === activeCategory));
          setComponentMap(map);
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
  }, [activeCategory, debouncedSearch]);

  const selectedOption = selections[selectionKeyMap[activeCategory]];

  function handleSelectOption(option: BuilderOption) {
    setSelection(selectionKeyMap[option.category], option);
  }

  function handleSelectStep(index: number) {
    setActiveStepIndex(index);
    setSearchQuery('');
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
          image: item.option!.image,
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
    }
  }

  const navigate = useNavigate();

  function handleAskAI() {
    navigate('/ai');
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
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:sticky lg:top-24">
            <div className="border-b border-slate-100 pb-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                CONFIGURATOR STAGES
              </span>
              <h2 className="mt-0.5 text-base font-extrabold text-slate-950 tracking-tight">
                Required Parts
              </h2>
            </div>

            <div className="mt-3 space-y-1.5">
              {buildSteps.map((step, index) => {
                const stepKey = selectionKeyMap[step.category];
                const chosen = selections[stepKey];
                const isSelected = Boolean(chosen);
                const isActive = index === activeStepIndex;

                return (
                  <div
                    key={step.category}
                    onClick={() => handleSelectStep(index)}
                    className={`group relative flex flex-col rounded-lg p-2.5 transition cursor-pointer border ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : isSelected
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-slate-900 hover:bg-emerald-50'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                            isActive
                              ? 'border-slate-700 bg-slate-800 text-cyan-400'
                              : isSelected
                              ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                              : 'border-slate-200 bg-slate-100 text-slate-400'
                          }`}
                        >
                          <CategoryIcon category={step.category} className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold leading-tight truncate">
                          {step.category}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded">
                            PICKED
                          </span>
                          <button
                            type="button"
                            title={`Clear ${step.category}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelection(stepKey);
                            }}
                            className={`rounded p-0.5 text-xs transition hover:bg-rose-100 hover:text-rose-600 ${
                              isActive ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            <HiOutlineXMark className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {chosen ? (
                      <div className="mt-1.5 pl-8 text-left">
                        <p
                          className={`text-[11px] font-semibold leading-tight line-clamp-1 ${
                            isActive ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {chosen.name}
                        </p>
                        <p
                          className={`font-mono text-[10px] font-bold mt-0.5 ${
                            isActive ? 'text-cyan-400' : 'text-emerald-700'
                          }`}
                        >
                          {formatPrice(chosen.price)}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-0.5 pl-8 text-left">
                        <span
                          className={`text-[10px] ${
                            isActive ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          Pending selection...
                        </span>
                      </div>
                    )}
                  </div>
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
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          {selectedOption && componentMap[selectedOption.id] && (
            <PriceComparisonPanel component={componentMap[selectedOption.id]} />
          )}
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

