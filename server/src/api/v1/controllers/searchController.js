import { ApiError } from '../../../utils/apiError.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { searchRetailers } from '../../../services/searchOrchestratorService.js';
import Component from '../../../models/Component.js';

/**
 * Escape regex special characters so user input can be used safely in a RegExp.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Search the local MongoDB database for components matching the query.
 * Uses a case-insensitive regex against name, brand, tags, category, and description.
 */
async function searchLocalComponents(query) {
  const pattern = new RegExp(escapeRegex(query), 'i');
  const components = await Component.find({
    $or: [
      { name: pattern },
      { brand: pattern },
      { tags: pattern },
      { category: pattern },
      { description: pattern },
    ],
  })
    .sort({ rating: -1, createdAt: -1 })
    .limit(50)
    .lean();

  return components;
}

export const searchProducts = async (req, res, next) => {
  try {
    const query = String(req.query.query ?? '').trim();
    if (!query) throw new ApiError(400, 'query is required.');

    // Run local DB search and retailer scraping in parallel.
    // If the scraper fails we still return local results.
    const [localComponents, retailerResult] = await Promise.all([
      searchLocalComponents(query).catch((err) => {
        console.error('[Search] Local DB search failed:', err.message);
        return [];
      }),
      searchRetailers(query).catch((err) => {
        console.error('[Search] Retailer search failed:', err.message);
        return { query, totalStores: 0, totalOffers: 0, cheapestOffer: null, offers: [] };
      }),
    ]);

    const responseData = {
      ...retailerResult,
      localComponents,
      localComponentCount: localComponents.length,
    };

    return sendSuccess(res, 200, 'Search completed successfully.', responseData);
  } catch (error) {
    return next(error);
  }
};
