const normalizeOffer = (offer = {}) => {
  const price = Number(offer.price ?? offer.currentPrice ?? 0);
  const storeName = offer.storeName || offer.store || 'Unknown Store';
  const inStock = typeof offer.inStock === 'boolean'
    ? offer.inStock
    : !String(offer.availability ?? '').toLowerCase().includes('out of stock');

  return {
    storeName,
    price,
    productUrl: offer.productUrl,
    inStock,
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
