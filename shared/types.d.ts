export interface PriceOffer {
  storeName: string;
  productUrl: string;
  price: number;
  currency?: string;
  inStock: boolean;
  availability?: string;
  lastUpdated?: string;
  image?: string;
}

export interface ComponentSummary {
  _id: string;
  name: string;
  brand: string;
  category: string;
  images: string[];
  stockStatus: string;
  tags: string[];
  rating: number;
  prices: PriceOffer[];
}

export interface ComponentDetail extends ComponentSummary {
  description: string;
  specifications: Record<string, unknown>;
  compatibility: Record<string, unknown>;
  reviewCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RetailerOffer {
  storeName: string;
  productName: string;
  price: number;
  currency: string;
  productUrl: string;
  image: string;
  availability: string;
  lastUpdated: string;
}

export interface BuilderOption {
  id: string;
  name: string;
  brand: string;
  price: number;
  powerWatts: number;
  description: string;
  category: string;
  compatibilityNotes: string[];
  image: string;
}

export interface SelectedComponent {
  category: string;
  option: BuilderOption | null;
}

export interface BuilderSelections {
  cpu: BuilderOption | null;
  motherboard: BuilderOption | null;
  ram: BuilderOption | null;
  gpu: BuilderOption | null;
  storage: BuilderOption | null;
  psu: BuilderOption | null;
  case: BuilderOption | null;
  cooler: BuilderOption | null;
}
