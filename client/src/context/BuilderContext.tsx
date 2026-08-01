import React, { createContext, useContext, useMemo, useState } from 'react';
import { BuilderOption, SelectedComponent, BuilderSelections } from '../types/builder';

interface BuilderContextType {
  selections: BuilderSelections;
  selectedComponents: SelectedComponent[];
  setSelection: (category: keyof BuilderSelections, option: BuilderOption | null) => void;
  updateSelection: (category: keyof BuilderSelections, option: BuilderOption | null) => void;
  removeSelection: (category: keyof BuilderSelections) => void;
  clearBuild: () => void;
  totalPrice: number;
  totalPower: number;
}

const defaultSelections: BuilderSelections = {
  cpu: null,
  motherboard: null,
  ram: null,
  gpu: null,
  storage: null,
  psu: null,
  case: null,
  cooler: null,
};

const categoryToSelectionKey = {
  CPU: 'cpu',
  Motherboard: 'motherboard',
  RAM: 'ram',
  GPU: 'gpu',
  Storage: 'storage',
  PSU: 'psu',
  Case: 'case',
  Cooler: 'cooler',
} as const;

const selectionKeyToCategory = {
  cpu: 'CPU',
  motherboard: 'Motherboard',
  ram: 'RAM',
  gpu: 'GPU',
  storage: 'Storage',
  psu: 'PSU',
  case: 'Case',
  cooler: 'Cooler',
} as const;

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<BuilderSelections>(defaultSelections);

  const setSelection = (category: keyof BuilderSelections, option: BuilderOption | null) => {
    setSelections((prev) => ({ ...prev, [category]: option }));
  };

  const updateSelection = (category: keyof BuilderSelections, option: BuilderOption | null) => {
    setSelections((prev) => ({ ...prev, [category]: option }));
  };

  const removeSelection = (category: keyof BuilderSelections) => {
    setSelections((prev) => ({ ...prev, [category]: null }));
  };

  const clearBuild = () => {
    setSelections(defaultSelections);
  };

  const selectedComponents = useMemo<SelectedComponent[]>(() => {
    return (Object.keys(selections) as Array<keyof BuilderSelections>).map((key) => ({
      category: selectionKeyToCategory[key],
      option: selections[key],
    }));
  }, [selections]);

  const totalPrice = useMemo(() => {
    return selectedComponents.reduce((sum, component) => sum + Number(component.option?.price ?? 0), 0);
  }, [selectedComponents]);

  const totalPower = useMemo(() => {
    return selectedComponents.reduce((sum, component) => sum + Number(component.option?.powerWatts ?? 0), 0);
  }, [selectedComponents]);

  return (
    <BuilderContext.Provider
      value={{
        selections,
        selectedComponents,
        setSelection,
        updateSelection,
        removeSelection,
        clearBuild,
        totalPrice,
        totalPower,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};

export { categoryToSelectionKey };
