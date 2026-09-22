/**
 * Offer contract for the scraper architecture.
 *
 * Exports TWO sets of functions:
 *
 *   1. Price-only (used by priceService.js for direct product page scraping):
 *      - validatePriceResult(result, storeName)
 *      - createPriceEntry(storeName, rawResult)
 *
 *   2. Full offer (used by search-flow normalizers and scraper services):
 *      - createStandardOffer(storeName, rawData)
 *      - validateOffer(offer)
 *      - logInvalidOffer(storeName, message, offer)
 */

export const REQUIRED_PRICE_FIELDS = ['price', 'availability'];

// ── Price-only helpers (product page scraping) ──────────────────────

/**
 * Validates a scraped price result.
 *
 * @param {{ price: number | null, availability: string }} result
 * @param {string} storeName — Retailer name for logging.
 * @returns {{ isValid: boolean, reason?: string }}
 */
export const validatePriceResult = (result, storeName) => {
  if (!result || typeof result !== 'object') {
    console.warn(`[Price Validator] ${storeName}: Result is null or not an object.`);
    return { isValid: false, reason: 'Result is null or not an object.' };
  }

  if (result.price == null || Number.isNaN(Number(result.price)) || Number(result.price) <= 0) {
    console.warn(`[Price Validator] ${storeName}: Price is missing or not a positive number.`, { price: result.price });
    return { isValid: false, reason: 'Price is missing or not a positive number.' };
  }

  if (!result.availability || typeof result.availability !== 'string' || result.availability.trim() === '') {
    console.warn(`[Price Validator] ${storeName}: Availability is missing or empty.`);
    return { isValid: false, reason: 'Availability is missing or empty.' };
  }

  return { isValid: true };
};

/**
 * Creates a standardized price entry from a raw scraper result.
 *
 * @param {string} storeName
 * @param {{ price: number | null, availability: string }} rawResult
 * @returns {{ price: number | null, availability: string, lastUpdated: Date, error: string | null, isValid: boolean }}
 */
export const createPriceEntry = (storeName, rawResult) => {
  const validation = validatePriceResult(rawResult, storeName);

  return {
    price: validation.isValid ? Number(rawResult.price) : null,
    availability: rawResult?.availability || 'Unknown',
    lastUpdated: new Date(),
    error: validation.isValid ? null : (validation.reason || 'Validation failed'),
    isValid: validation.isValid,
  };
};

// ── Full offer helpers (search-flow normalizers) ────────────────────

/**
 * Creates a standardized offer from raw retailer data.
 * Used by the per-retailer normalizer modules (normalizeMDComputers, etc.).
 *
 * @param {string} storeName
 * @param {object} rawData — Raw scraped product data with mixed field names.
 * @returns {object} — Standardized offer with isValid flag.
 */
export const createStandardOffer = (storeName, rawData = {}) => {
  const price = Number(rawData.price) || 0;
  const isValid = price > 0 && !!rawData.productName;

  return {
    storeName,
    productName: rawData.productName || '',
    price,
    currency: rawData.currency || 'INR',
    productUrl: rawData.productUrl || '',
    image: rawData.image || '',
    availability: rawData.availability || 'Unknown',
    lastUpdated: rawData.lastUpdated || new Date().toISOString(),
    isValid,
  };
};

/**
 * Validates a standardized offer (used by search flow).
 *
 * @param {object} offer — Output from createStandardOffer.
 * @returns {{ isValid: boolean, reason?: string }}
 */
export const validateOffer = (offer) => {
  if (!offer || typeof offer !== 'object') {
    return { isValid: false, reason: 'Offer is null or not an object.' };
  }
  if (!offer.productName) {
    return { isValid: false, reason: 'Missing product name.' };
  }
  if (!offer.price || offer.price <= 0) {
    return { isValid: false, reason: 'Price is missing or invalid.' };
  }
  return { isValid: true };
};

/**
 * Logs a discarded/invalid offer for debugging.
 *
 * @param {string} storeName
 * @param {string} message
 * @param {object} offer
 */
export const logInvalidOffer = (storeName, message, offer) => {
  console.warn(`[${storeName} Normalizer] ${message}`, {
    productName: offer?.productName,
    price: offer?.price,
    productUrl: offer?.productUrl,
  });
};

