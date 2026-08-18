import apiClient from './axios';
import type {
  ApiResponse,
  ComponentDetail,
  ComponentFormData,
  ComponentPriceComparisonResponse,
  ComponentQueryParams,
  ComponentsResponse,
} from '../types/component';

/**
 * Pure API functions for the /components resource.
 *
 * Each function maps 1:1 to a backend endpoint. No React state, no hooks —
 * this module is consumed exclusively by custom hooks.
 *
 * All mutating requests (POST, PUT) use FormData so that image File objects
 * can be included in the same request as JSON-compatible fields.
 */

/**
 * Converts the typed form data into a FormData object suitable for
 * multipart/form-data submission (required for image file uploads).
 *
 * Key decisions:
 * - `createdBy` is NOT sent — the backend derives it from the JWT.
 * - `existingImages[]` tells the server which Cloudinary URLs to keep.
 * - Complex values are serialized explicitly so multipart requests preserve types.
 * - `tags[]` is sent as individual entries so Express can parse them as an array.
 */
function buildFormData(data: ComponentFormData, isEdit = false): FormData {
  const fd = new FormData();

  fd.append('name', data.name);
  fd.append('brand', data.brand);
  fd.append('category', data.category);
  fd.append('description', data.description || '');
  fd.append('stockStatus', data.stockStatus);

  // Tags: comma-separated string → individual FormData entries
  const tagsArray = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];
  tagsArray.forEach((tag) => fd.append('tags[]', tag));

  // Specifications: key-value pairs → JSON string
  if (data.specifications && Object.keys(data.specifications).length > 0) {
    fd.append('specifications', JSON.stringify(data.specifications));
  }
  fd.append('prices', JSON.stringify(data.prices.map((price) => ({
    store: price.store || price.storeName || '',
    storeName: price.storeName || price.store || '',
    productUrl: price.productUrl,
    price: Number(price.price ?? price.currentPrice ?? 0),
    currentPrice: Number(price.currentPrice ?? price.price ?? 0),
    inStock: typeof price.inStock === 'boolean'
      ? price.inStock
      : !String(price.availability ?? '').toLowerCase().includes('out of stock'),
    availability: price.availability || (typeof price.inStock === 'boolean' ? (price.inStock ? 'Available' : 'Out of Stock') : 'Available'),
    currency: price.currency ?? 'INR',
    lastUpdated: new Date().toISOString(),
  }))));

  // New image files selected by the user
  if (data.images && data.images.length > 0) {
    Array.from(data.images).forEach((file) => {
      fd.append('images', file);
    });
  }

  // Existing image URLs to keep on the server (edit mode only)
  // Sent as existingImages[] so Express can parse them as an array.
  if (isEdit && data.existingImages) {
    data.existingImages.forEach((url) => fd.append('existingImages[]', url));
  }

  // The validator requires an images array even when no files are uploaded.
  // When no new files are selected, send the kept existing URLs as the array.
  if (!data.images || data.images.length === 0) {
    const fallbackImages = isEdit ? (data.existingImages ?? []) : [];
    fallbackImages.forEach((url) => fd.append('images', url));
    // If there are no images at all, send an empty array marker
    if (fallbackImages.length === 0) {
      fd.append('images', '');
    }
  }

  return fd;
}

// ── API Functions 

/**
 * Fetch a paginated, filtered, sorted list of components.
 */
export async function getComponents(
  params: ComponentQueryParams = {},
): Promise<ComponentsResponse> {
  const response = await apiClient.get<ApiResponse<ComponentsResponse>>(
    '/components',
    { params },
  );
  return response.data.data;
}

/**
 * Fetch randomly sampled components for the home page featured section.
 * Returns components that have images and prices where possible.
 */
export async function getFeaturedComponents(
  limit = 12,
): Promise<ComponentDetail[]> {
  const response = await apiClient.get<ApiResponse<ComponentDetail[]>>(
    '/components/featured',
    { params: { limit } },
  );
  return response.data.data;
}

/**
 * Fetch a single component by its Mongo ObjectId.
 */
export async function getComponentById(
  id: string,
): Promise<ComponentDetail> {
  const response = await apiClient.get<ApiResponse<ComponentDetail>>(
    `/components/${id}`,
  );
  return response.data.data;
}

/**
 * Fetch related components for a selected product.
 */
export async function getComponentPrices(
  id: string,
): Promise<ComponentPriceComparisonResponse> {
  const response = await apiClient.get<ApiResponse<ComponentPriceComparisonResponse>>(
    `/components/${id}/prices`,
  );
  return response.data.data;
}

export async function getRelatedComponents(
  id: string,
): Promise<ComponentDetail[]> {
  const response = await apiClient.get<ApiResponse<ComponentDetail[]>>(
    `/components/${id}/related`,
  );
  return response.data.data;
}

/**
 * Create a new component. Sends as FormData for image upload support.
 * The backend sets `createdBy` from the JWT — it must not be in the body.
 */
export async function createComponent(
  data: ComponentFormData,
): Promise<ComponentDetail> {
  const formData = buildFormData(data, false);

  const response = await apiClient.post<ApiResponse<ComponentDetail>>(
    '/components',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data.data;
}

/**
 * Update an existing component. Sends as FormData for image upload support.
 * Pass `existingImages` in the form data to tell the server which URLs to keep.
 */
export async function updateComponent(
  id: string,
  data: ComponentFormData,
): Promise<ComponentDetail> {
  const formData = buildFormData(data, true);

  const response = await apiClient.put<ApiResponse<ComponentDetail>>(
    `/components/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data.data;
}

/**
 * Delete a component by its Mongo ObjectId.
 * The server will also purge its Cloudinary images.
 */
export async function deleteComponent(id: string): Promise<void> {
  await apiClient.delete(`/components/${id}`);
}
