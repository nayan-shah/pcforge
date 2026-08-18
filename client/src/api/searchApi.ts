import apiClient from './axios';
import type { ApiResponse, RetailerSearchResponse } from '../types/component';

/**
 * Calls the live-scraper search endpoint.
 *
 * GET /api/search?query=<query>
 *
 * The backend orchestrates MDComputers, PrimeABGB, and Vedant scrapers in
 * parallel and returns deduplicated, price-sorted offers.
 */
export async function searchRetailers(query: string): Promise<RetailerSearchResponse> {
  const response = await apiClient.get<ApiResponse<RetailerSearchResponse>>('/search', {
    params: { query },
  });
  return response.data.data;
}
