import { ApiError } from '../../../utils/apiError.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { searchRetailers } from '../../../services/searchOrchestratorService.js';
import { getPrices } from '../../../services/priceService.js';
import { sortPricesLowToHigh } from '../../../services/priceComparisonService.js';
import Component from '../../../models/Component.js';

/**
 * Escape regex special characters so user input can be used safely in a RegExp.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Maps a normalized offer array (from generateMultiStoreOffers) into a flat
 * per-store keyed object:
 *
 *   {
 *     "MDComputers": { price, availability, lastUpdated, productUrl, currency },
 *     "Vedant":      { ... },
 *     ...
 *   }
 *
 * This is the format the frontend's CatalogSearchCard expects.
 */
function buildPriceMap(offers) {
  const map = {};
  for (const offer of offers) {
    const key = offer.storeName || offer.store;
    if (!key) continue;
    map[key] = {
      price: offer.price ?? offer.currentPrice ?? null,
      availability: offer.availability ?? 'Unknown',
      lastUpdated: offer.lastUpdated ?? new Date().toISOString(),
      productUrl: offer.productUrl ?? null,
      currency: offer.currency ?? 'INR',
      inStock: offer.inStock ?? !String(offer.availability ?? '').toLowerCase().includes('out of stock'),
    };
  }
  return map;
}

/**
 * Search the local MongoDB database for components matching the query.
 * Uses a case-insensitive regex against name, brand, tags, category, and description.
 * Results are ordered by rating desc (most reviewed first).
 */
async function searchLocalComponents(query) {
  const pattern = new RegExp(escapeRegex(query), 'i');
  return Component.find({
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
}

/**
 * Enriches up to MAX_ENRICHED DB components with live/cached price data and
 * transforms the result into the CatalogSearchResult format:
 *
 *   { _id, name, brand, category, images, specifications, prices: { store: {...} } }
 *
 * Calls getPrices(id, { forceRefresh: false }) — serves cached prices when fresh
 * (per-store TTL), only scrapes live when a store's cache is stale.
 * Errors from individual price fetches are silently ignored; the component
 * is still returned, just with fewer price entries.
 *
 * Capped at MAX_ENRICHED to keep p99 response time predictable.
 */
const MAX_ENRICHED = 10;

async function buildCatalogResults(components) {
  const toEnrich = components.slice(0, MAX_ENRICHED);

  const enriched = await Promise.allSettled(
    toEnrich.map(async (comp) => {
      let offers = [];

      try {
        // getPrices() returns the raw prices[] array from the DB / scraper.
        const rawPrices = await getPrices(String(comp._id), { forceRefresh: false });

        // Normalize and sort real prices only (no estimated/fake offers).
        offers = sortPricesLowToHigh(rawPrices ?? comp.prices ?? []);
      } catch (err) {
        // Fall back to cached DB prices if the price service errors.
        console.warn(`[SearchController] Price enrichment failed for "${comp.name}": ${err.message}`);
        offers = sortPricesLowToHigh(comp.prices ?? []);
      }

      return {
        _id: comp._id,
        name: comp.name,
        brand: comp.brand,
        category: comp.category,
        images: comp.images ?? [],
        specifications: comp.specifications ?? {},
        compatibility: comp.compatibility ?? {},
        rating: comp.rating ?? 0,
        reviewCount: comp.reviewCount ?? 0,
        stockStatus: comp.stockStatus ?? 'In Stock',
        prices: buildPriceMap(offers),
      };
    }),
  );

  return enriched
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}

/**
 * GET /api/v1/search?query=<term>
 *
 * Runs three operations in parallel:
 *   1. searchLocalComponents — MongoDB regex search
 *   2. searchRetailers — live Playwright scrape of 4 retailers
 *
 * Then builds catalogResults by calling getPrices() for the top DB matches.
 *
 * Response shape:
 * {
 *   query,
 *   // Raw retailer scraper offers (for the OfferCard list in SearchResults):
 *   totalStores, totalOffers, cheapestOffer, offers,
 *   // Catalog components enriched with per-retailer price maps:
 *   catalogResults: [{ _id, name, brand, images, specifications, prices: { MDComputers: {...} } }],
 *   localComponentCount,
 * }
 */
export const searchProducts = async (req, res, next) => {
  try {
    const query = String(req.query.query ?? '').trim();
    if (!query) throw new ApiError(400, 'query is required.');

    // Step 1 + 2: Run DB search and retailer scraping concurrently.
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

    // Step 3: Enrich top DB components with per-store price maps.
    // This is intentionally NOT awaited in parallel with step 1+2 because
    // it depends on the localComponents result.
    const catalogResults = await buildCatalogResults(localComponents).catch((err) => {
      console.error('[Search] Catalog enrichment failed:', err.message);
      return [];
    });

    return sendSuccess(res, 200, 'Search completed successfully.', {
      ...retailerResult,
      catalogResults,
      localComponentCount: localComponents.length,
    });
  } catch (error) {
    return next(error);
  }
};
