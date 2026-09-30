const TRACKED_STORES = [
  { name: 'PCStudio' },
  { name: 'Vedant Computers' },
  { name: 'MDComputers' },
  { name: 'PrimeABGB' },
  // Amazon India removed — no working scraper exists.
];

export const normalizeOffer = (offer = {}) => {
  const price = Number(offer.price ?? offer.currentPrice ?? 0);
  const storeName = offer.storeName || offer.store || 'Unknown Store';
  const inStock = typeof offer.inStock === 'boolean'
    ? offer.inStock
    : !String(offer.availability ?? '').toLowerCase().includes('out of stock');

  return {
    store: storeName,
    storeName,
    price,
    currentPrice: price,
    currency: offer.currency || 'INR',
    productUrl: offer.productUrl,
    inStock,
    availability: offer.availability || (inStock ? 'In Stock' : 'Out of Stock'),
    lastUpdated: offer.lastUpdated || new Date().toISOString(),
  };
};

export const getLowestPrice = (prices = []) => {
  const offers = sortPricesLowToHigh(prices);
  return offers.length > 0 ? offers[0].price : null;
};

export const sortPricesLowToHigh = (prices = []) => {
  return [...prices]
    .map((offer) => normalizeOffer(offer))
    .filter((offer) => typeof offer.productUrl === 'string' && offer.productUrl.trim().length > 0)
    .sort((a, b) => a.price - b.price);
};

export const filterAvailableProducts = (prices = []) => {
  return [...prices]
    .map((offer) => normalizeOffer(offer))
    .filter((offer) => offer.inStock);
};

/**
 * Normalizes and sorts existing price offers for a component.
 * Only returns real retailer offers — never generates estimated prices
 * for stores that don't have an actual offer.
 *
 * @param {string} _componentName — Component name (kept for API compat, unused).
 * @param {object[]} existingPrices — The prices array from the DB / scraper.
 * @returns {object[]} — Normalized, sorted offers (lowest price first).
 */
export function generateMultiStoreOffers(_componentName, existingPrices = []) {
  return sortPricesLowToHigh(existingPrices);
}

export default {
  normalizeOffer,
  getLowestPrice,
  sortPricesLowToHigh,
  filterAvailableProducts,
  generateMultiStoreOffers,
};
