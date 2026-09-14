import { useMemo } from 'react';
import { HiMagnifyingGlass, HiOutlineCheckBadge } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import type { BuilderOption, ComponentCategory } from '../../types/builder';
import CategoryIcon from '../common/CategoryIcon';
import { formatPrice } from '../../utils/formatters';

interface ComponentSelectorProps {
  category: ComponentCategory;
  options: BuilderOption[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (option: BuilderOption) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function ComponentSelector({
  category,
  options,
  selectedId,
  loading,
  onSelect,
  searchQuery = '',
  onSearchChange,
}: ComponentSelectorProps) {
  // Sort the selected option to the TOP-LEFT corner (index 0) of the grid
  const sortedOptions = useMemo(() => {
    if (!selectedId) return options;
    const selected = options.find((opt) => opt.id === selectedId);
    if (!selected) return options;
    const others = options.filter((opt) => opt.id !== selectedId);
    return [selected, ...others];
  }, [options, selectedId]);

  const activeSelected = useMemo(() => {
    return options.find((opt) => opt.id === selectedId) || null;
  }, [options, selectedId]);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-700 border border-slate-200">
              STEP SELECTOR
            </span>
            <span className="text-xs font-semibold text-slate-500">Active Category: {category}</span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-slate-950 tracking-tight">
            Choose Your {category}
          </h3>
        </div>
        {onSearchChange && (
          <div className="relative w-full sm:w-64 shrink-0">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Filter ${category} options...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
            />
          </div>
        )}
      </div>

      {/* Selected Component Quick Notice at Top-Left */}
      {activeSelected && (
        <div className="flex items-center justify-between rounded-lg border border-slate-900 bg-slate-950 px-3.5 py-2.5 text-white shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500 text-slate-950">
              <HiOutlineCheckBadge className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-400">
                Selected in Top-Left Slot:
              </span>
              <p className="text-xs font-bold text-white truncate">{activeSelected.name}</p>
            </div>
          </div>
          <span className="font-mono text-sm font-extrabold text-white shrink-0 ml-3">
            {formatPrice(activeSelected.price)}
          </span>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-10 text-center text-xs font-mono text-slate-500">
          Fetching validated {category} options from database...
        </div>
      ) : sortedOptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-xs text-slate-500">
          No {category} options currently available. Try modifying your search filter.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {sortedOptions.map((option, index) => {
              const isSelected = option.id === selectedId;
              return (
                <motion.button
                  layout
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-950 text-white shadow-md ring-2 ring-cyan-400/60'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${
                              isSelected ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {option.brand}
                          </span>
                          {isSelected && index === 0 && (
                            <span className="font-mono text-[9px] font-bold bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded">
                              TOP LEFT (SELECTED)
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-xs font-bold leading-snug line-clamp-2 mt-0.5 ${
                            isSelected ? 'text-white' : 'text-slate-950'
                          }`}
                        >
                          {option.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <span className="shrink-0 font-mono text-[10px] font-bold bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {option.description && (
                      <p
                        className={`line-clamp-2 text-[11px] leading-relaxed ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {option.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${
                      isSelected ? 'border-slate-800' : 'border-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-sm font-extrabold tracking-tight">
                        {formatPrice(option.price)}
                      </span>
                    </div>
                    {option.powerWatts > 0 && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {option.powerWatts}W TDP
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}


