export const normalizeOffer = (offer = {}) => {
  const price =
    [offer.price, offer.currentPrice]
      .map(Number)
      .find((candidate) => Number.isFinite(candidate) && candidate > 0) ?? null;
  const storeName = offer.storeName || offer.store || 'Unknown Store';
  const inStock = typeof offer.inStock === 'boolean' ? offer.inStock : null;

  return {
    store: storeName,
    storeName,
    price,
    currentPrice: price,
    currency: offer.currency || 'INR',
    productUrl: offer.productUrl,
    inStock,
    availability: offer.availability || 'Unknown',
    lastUpdated: offer.lastUpdated || null,
    stale: offer.stale ?? false,
    lastFetchError: offer.lastFetchError || null,
  };
};

export const getLowestPrice = (prices = []) => {
  const offers = sortPricesLowToHigh(prices).filter(
    (offer) => offer.price != null && offer.price > 0 && offer.inStock === true,
  );
  return offers.length > 0 ? offers[0].price : null;
};

export const sortPricesLowToHigh = (prices = []) => {
  return [...prices]
    .map((offer) => normalizeOffer(offer))
    .filter((offer) => typeof offer.productUrl === 'string' && offer.productUrl.trim().length > 0)
    .sort((a, b) => {
      if (a.price == null) return b.price == null ? 0 : 1;
      if (b.price == null) return -1;
      return a.price - b.price;
    });
};

export const filterAvailableProducts = (prices = []) => {
  return [...prices]
    .map((offer) => normalizeOffer(offer))
    .filter((offer) => offer.price != null && offer.price > 0 && offer.inStock === true);
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
