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

// ── API layer types ──────────────────────────────────────────────────

/** Standard backend response envelope. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Shape of the paginated GET /components response data. */
export interface ComponentsResponse {
  components: ComponentDetail[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/** Query params accepted by GET /components. */
export interface ComponentQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/** Payload shape for the admin component form (before FormData conversion). */
export interface ComponentFormData {
  name: string;
  brand: string;
  category: string;
  description: string;
  stockStatus: string;
  tags: string;
  specifications: Record<string, string>;
  images?: FileList | null;
  existingImages?: string[];
}

/** Toast notification for admin UI feedback. */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

