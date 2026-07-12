export interface PriceOffer {
  storeName: string;
  productUrl: string;
  currentPrice: number;
  currency: string;
  availability: string;
  lastUpdated: string;
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
