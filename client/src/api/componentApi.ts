import apiClient from './axios';
import type {
  ApiResponse,
  ComponentDetail,
  ComponentFormData,
  ComponentQueryParams,
  ComponentsResponse,
} from '../types/component';

/**
 * Pure API functions for the /components resource.
 *
 * Each function maps 1:1 to a backend endpoint. No React state, no hooks —
 * this module is consumed exclusively by custom hooks.
 */

// ── Placeholder ──────────────────────────────────────────────────────
// TODO: Replace with the real authenticated user ID once auth is integrated.
const PLACEHOLDER_CREATED_BY = '000000000000000000000000';

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Converts the typed form data into a FormData object suitable for
 * multipart/form-data submission (required for image file uploads).
 */
function buildFormData(data: ComponentFormData, isEdit = false): FormData {
  const fd = new FormData();

  fd.append('name', data.name);
  fd.append('brand', data.brand);
  fd.append('category', data.category);
  fd.append('description', data.description || '');
  fd.append('stockStatus', data.stockStatus);

  // Tags: comma-separated string → JSON array
  const tagsArray = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];
  tagsArray.forEach((tag) => fd.append('tags[]', tag));

  // Specifications: key-value pairs → JSON string
  if (data.specifications && Object.keys(data.specifications).length > 0) {
    fd.append('specifications', JSON.stringify(data.specifications));
  }

  // New image files
  if (data.images && data.images.length > 0) {
    Array.from(data.images).forEach((file) => {
      fd.append('images', file);
    });
  }

  // Existing image URLs to keep (edit mode only)
  if (isEdit && data.existingImages) {
    data.existingImages.forEach((url) => fd.append('existingImages[]', url));
  }

  // Required by the backend model
  if (!isEdit) {
    fd.append('createdBy', PLACEHOLDER_CREATED_BY);
  }

  // The validator expects these fields to exist even if empty
  if (!data.images || data.images.length === 0) {
    fd.append('images', JSON.stringify(data.existingImages || []));
  }

  fd.append('prices', JSON.stringify([]));

  return fd;
}

// ── API Functions ────────────────────────────────────────────────────

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
 * Create a new component. Sends as FormData for image upload support.
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
 */
export async function deleteComponent(id: string): Promise<void> {
  await apiClient.delete(`/components/${id}`);
}
