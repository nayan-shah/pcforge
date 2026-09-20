import Component from '../models/Component.js';
import { fetchMdComputersPageHtml } from './scrapers/mdcomputers/mdComputersClient.js';
import { parseMdComputersProductPrice } from './scrapers/mdcomputers/mdComputersParser.js';
import { fetchVedantPageHtml } from './scrapers/vedant/vedantClient.js';
import { parseVedantProductPrice } from './scrapers/vedant/vedantParser.js';
import { fetchPrimeAbgbPageHtml } from './scrapers/primeabgb/primeAbgbClient.js';
import { parsePrimeAbgbProductPrice } from './scrapers/primeabgb/primeAbgbParser.js';
import { fetchPcStudioPageHtml } from './scrapers/pcstudio/pcStudioClient.js';
import { parsePcStudioProductPrice } from './scrapers/pcstudio/pcStudioParser.js';
import { createPriceEntry } from './scrapers/adapters/offerContract.js';

// ── Retailer configuration ────────────────────────────────────────────
// Per-store TTL (cache freshness), scraper functions, and retry settings.

const RETAILER_CONFIG = {
  MDComputers: {
    ttlMinutes: 60,
    fetchHtml: fetchMdComputersPageHtml,
    parsePrice: parseMdComputersProductPrice,
    retries: 3,
  },
  Vedant: {
    ttlMinutes: 30,
    fetchHtml: fetchVedantPageHtml,
    parsePrice: parseVedantProductPrice,
    retries: 3,
  },
  PrimeABGB: {
    ttlMinutes: 60,
    fetchHtml: fetchPrimeAbgbPageHtml,
    parsePrice: parsePrimeAbgbProductPrice,
    retries: 3,
  },
  PCStudio: {
    ttlMinutes: 30,
    fetchHtml: fetchPcStudioPageHtml,
    parsePrice: parsePcStudioProductPrice,
    retries: 3,
  },
};

const RETRY_BASE_DELAY_MS = 2000;

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Delays execution by a given number of milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Checks whether a cached price entry is still fresh.
 *
 * @param {object} priceEntry — Stored price entry from component.prices
 * @param {number} ttlMinutes — Maximum age in minutes before considered stale.
 * @returns {boolean}
 */
const isFresh = (priceEntry, ttlMinutes) => {
  if (!priceEntry || !priceEntry.lastUpdated) return false;
  const ageMs = Date.now() - new Date(priceEntry.lastUpdated).getTime();
  return ageMs < ttlMinutes * 60 * 1000;
};

/**
 * Scrapes a single retailer with retry logic.
 *
 * @param {string} storeName
 * @param {string} productUrl
 * @returns {Promise<{ price: number | null, availability: string, lastUpdated: Date, error: string | null }>}
 */
async function scrapeWithRetry(storeName, productUrl) {
  const config = RETAILER_CONFIG[storeName];
  if (!config) {
    return createPriceEntry(storeName, null);
  }

  let lastError = null;

  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.info(`[PriceService] Scraping ${storeName} (attempt ${attempt}/${config.retries}).`, { productUrl });

      const html = await config.fetchHtml(productUrl);
      if (!html) {
        throw new Error('Empty HTML response from retailer.');
      }

      const result = config.parsePrice(html);
      const entry = createPriceEntry(storeName, result);

      if (entry.isValid) {
        console.info(`[PriceService] ${storeName} scraped successfully.`, { price: entry.price, availability: entry.availability });
        return entry;
      }

      // Parsed but invalid (e.g., price was 0 or missing).
      lastError = entry.error || 'Parsed result was invalid.';
      console.warn(`[PriceService] ${storeName} returned invalid data on attempt ${attempt}.`, { error: lastError });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[PriceService] ${storeName} attempt ${attempt} failed.`, { error: lastError });
    }

    // Exponential backoff before retry (skip delay on last attempt).
    if (attempt < config.retries) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.info(`[PriceService] Retrying ${storeName} in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All retries exhausted — return error entry.
  return {
    price: null,
    availability: 'Unknown',
    lastUpdated: new Date(),
    error: lastError || 'All retry attempts failed.',
  };
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Fetches live prices for a component from all configured retailers.
 * Uses the component's `retailers` map for product page URLs.
 * Saves results to the component's `prices` map in MongoDB.
 *
 * @param {string} componentId — MongoDB ObjectId of the component.
 * @returns {Promise<object>} — Map of storeName → { price, availability, lastUpdated, error }
 */
export async function fetchLivePrices(componentId) {
  const component = await Component.findById(componentId);
  if (!component) throw new Error(`Component not found: ${componentId}`);

  const retailers = component.retailers instanceof Map
    ? Object.fromEntries(component.retailers)
    : (component.retailers || {});

  // Initialize prices map if needed.
  if (!(component.prices instanceof Map)) {
    component.prices = new Map();
  }

  // Scrape all retailers in parallel.
  const retailerEntries = Object.keys(RETAILER_CONFIG);
  const results = await Promise.allSettled(
    retailerEntries.map(async (storeName) => {
      const retailerInfo = retailers[storeName];
      const productUrl = retailerInfo?.productUrl;

      if (!productUrl) {
        console.warn(`[PriceService] No product URL for ${storeName} on component ${component.name}.`);
        return {
          storeName,
          entry: {
            price: null,
            availability: 'Unknown',
            lastUpdated: new Date(),
            error: 'No product URL configured for this retailer.',
          },
        };
      }

      const entry = await scrapeWithRetry(storeName, productUrl);
      return { storeName, entry };
    }),
  );

  // Update component.prices in DB.
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { storeName, entry } = result.value;
      component.prices.set(storeName, {
        price: entry.price,
        availability: entry.availability,
        lastUpdated: entry.lastUpdated,
        error: entry.error || null,
      });
    } else {
      console.error('[PriceService] Unexpected settlement failure.', { reason: result.reason });
    }
  }

  component.pricesUpdatedAt = new Date();
  await component.save();

  console.info(`[PriceService] Prices updated for "${component.name}".`, {
    retailers: retailerEntries.length,
    componentId,
  });

  return Object.fromEntries(component.prices);
}

/**
 * Gets cached prices for a component, refreshing if stale.
 *
 * @param {string} componentId — MongoDB ObjectId.
 * @param {{ maxAgeMinutes?: number, forceRefresh?: boolean }} options
 * @returns {Promise<object>} — Map of storeName → { price, availability, lastUpdated, error }
 */
export async function getPrices(componentId, options = {}) {
  const { maxAgeMinutes = 60, forceRefresh = false } = options;

  const component = await Component.findById(componentId).lean();
  if (!component) throw new Error(`Component not found: ${componentId}`);

  // Convert stored prices back from plain object (lean() returns POJO, not Map).
  const existingPrices = component.prices || {};

  // Check if any prices are stale or if a force refresh was requested.
  if (forceRefresh) {
    return fetchLivePrices(componentId);
  }

  // Check per-retailer staleness using per-store TTL.
  const staleRetailers = Object.keys(RETAILER_CONFIG).filter((storeName) => {
    const config = RETAILER_CONFIG[storeName];
    const priceEntry = existingPrices[storeName];
    return !isFresh(priceEntry, config.ttlMinutes);
  });

  // If any retailer is stale, refresh all prices.
  if (staleRetailers.length > 0) {
    console.info(`[PriceService] Stale prices detected for: ${staleRetailers.join(', ')}. Refreshing...`);
    return fetchLivePrices(componentId);
  }

  return existingPrices;
}

/**
 * Force-refreshes prices for all components that have retailer URLs.
 * Processes in batches to avoid overwhelming scrapers.
 *
 * @param {{ batchSize?: number }} options
 * @returns {Promise<{ succeeded: number, failed: number, skipped: number }>}
 */
export async function refreshAllPrices(options = {}) {
  const { batchSize = 3 } = options;

  // Find all components that have at least one retailer URL.
  const components = await Component.find({
    $or: Object.keys(RETAILER_CONFIG).map((store) => ({
      [`retailers.${store}.productUrl`]: { $exists: true, $ne: '' },
    })),
  }).select('_id name').lean();

  console.info(`[PriceService] Bulk refresh starting for ${components.length} components.`);

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  // Process in batches.
  for (let i = 0; i < components.length; i += batchSize) {
    const batch = components.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (comp) => {
        try {
          await fetchLivePrices(comp._id);
          succeeded++;
        } catch (err) {
          console.error(`[PriceService] Bulk refresh failed for "${comp.name}".`, {
            error: err instanceof Error ? err.message : String(err),
          });
          failed++;
        }
      }),
    );
  }

  console.info(`[PriceService] Bulk refresh complete.`, { succeeded, failed, skipped });
  return { succeeded, failed, skipped };
}

export default { fetchLivePrices, getPrices, refreshAllPrices };
