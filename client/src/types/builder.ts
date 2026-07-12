export type ComponentCategory =
  | 'CPU'
  | 'GPU'
  | 'RAM'
  | 'Motherboard'
  | 'PSU'
  | 'Storage'
  | 'Case'
  | 'Cooler';

export interface BuilderOption {
  id: string;
  name: string;
  brand: string;
  price: number;
  powerWatts: number;
  description: string;
  category: ComponentCategory;
  compatibilityNotes: string[];
}

export interface SelectedComponent {
  category: ComponentCategory;
  option: BuilderOption | null;
}

export interface BuildStep {
  category: ComponentCategory;
  title: string;
  description: string;
}
