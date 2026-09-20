/**
 * Simplified offer contract for the refactored price-only scraper architecture.
 *
 * After the refactor, scrapers return only { price, availability }.
 * This module validates those two fields.
 */

export const REQUIRED_PRICE_FIELDS = ['price', 'availability'];

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
