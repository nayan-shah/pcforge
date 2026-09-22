/**
 * priceService.js — Fetches live prices from Indian retailers for seeded
 * components using Playwright-based scrapers.
 *
 * Each component stores its retailer URLs inside the `prices[]` array
 * (priceSchema entries with `storeName` + `productUrl`). This service:
 *   1. Reads those URLs from the prices array.
 *   2. Scrapes each retailer page in parallel (with retry + exponential backoff).
 *   3. Updates the prices array in-place with fresh price/availability data.
 *   4. Respects per-store TTL to avoid unnecessary re-scrapes.
 */

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
    retries: 2,
  },
  Vedant: {
    ttlMinutes: 30,
    fetchHtml: fetchVedantPageHtml,
    parsePrice: parseVedantProductPrice,
    retries: 2,
  },
  PrimeABGB: {
    ttlMinutes: 60,
    fetchHtml: fetchPrimeAbgbPageHtml,
    parsePrice: parsePrimeAbgbProductPrice,
    retries: 2,
  },
  PCStudio: {
    ttlMinutes: 30,
    fetchHtml: fetchPcStudioPageHtml,
    parsePrice: parsePcStudioProductPrice,
    retries: 2,
  },
};

const RETRY_BASE_DELAY_MS = 2000;

// ── Helpers ────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Checks whether a cached price entry is still fresh.
 *
 * @param {object} priceEntry — Stored price entry from component.prices[]
 * @param {number} ttlMinutes — Maximum age in minutes before considered stale.
 * @returns {boolean}
 */
const isFresh = (priceEntry, ttlMinutes) => {
  if (!priceEntry || !priceEntry.lastUpdated) return false;
  const ageMs = Date.now() - new Date(priceEntry.lastUpdated).getTime();
  return ageMs < ttlMinutes * 60 * 1000;
};

/**
 * Resolves the store name from a price entry to a RETAILER_CONFIG key.
 * Handles common variations (e.g. "Vedant Computers" → "Vedant").
 *
 * @param {string} storeName — The storeName from a price entry.
 * @returns {string | null} — Matching RETAILER_CONFIG key, or null.
 */
const resolveConfigKey = (storeName) => {
  if (!storeName) return null;
  const lower = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const key of Object.keys(RETAILER_CONFIG)) {
    if (lower.includes(key.toLowerCase().replace(/[^a-z0-9]/g, ''))) return key;
  }
  return null;
};

/**
 * Scrapes a single retailer with retry logic.
 *
 * @param {string} configKey — Key in RETAILER_CONFIG (e.g. "MDComputers")
 * @param {string} productUrl — Direct URL to the product page
 * @returns {Promise<{ price: number|null, availability: string, lastUpdated: Date, error: string|null, isValid: boolean }>}
 */
async function scrapeWithRetry(configKey, productUrl) {
  const config = RETAILER_CONFIG[configKey];
  if (!config) {
    return {
      price: null,
      availability: 'Unknown',
      lastUpdated: new Date(),
      error: `No scraper configured for "${configKey}".`,
      isValid: false,
    };
  }

  let lastError = null;

  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.info(`[PriceService] Scraping ${configKey} (attempt ${attempt}/${config.retries}).`, { productUrl });

      const html = await config.fetchHtml(productUrl);
      if (!html) {
        throw new Error('Empty HTML response from retailer.');
      }

      const result = config.parsePrice(html);
      const entry = createPriceEntry(configKey, result);

      if (entry.isValid) {
        console.info(`[PriceService] ${configKey} scraped successfully.`, {
          price: entry.price,
          availability: entry.availability,
        });
        return entry;
      }

      // Parsed but invalid (e.g., price was 0 or missing).
      lastError = entry.error || 'Parsed result was invalid.';
      console.warn(`[PriceService] ${configKey} returned invalid data on attempt ${attempt}.`, { error: lastError });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[PriceService] ${configKey} attempt ${attempt} failed.`, { error: lastError });
    }

    // Exponential backoff before retry (skip delay on last attempt).
    if (attempt < config.retries) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.info(`[PriceService] Retrying ${configKey} in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All retries exhausted — return error entry.
  return {
    price: null,
    availability: 'Unknown',
    lastUpdated: new Date(),
    error: lastError || 'All retry attempts failed.',
    isValid: false,
  };
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Fetches live prices for a component from all configured retailers.
 * Reads product URLs from the component's `prices[]` array entries.
 * Updates the prices array in MongoDB with fresh scraped data.
 *
 * @param {string} componentId — MongoDB ObjectId of the component.
 * @returns {Promise<object[]>} — Updated prices array.
 */
export async function fetchLivePrices(componentId) {
  const component = await Component.findById(componentId);
  if (!component) throw new Error(`Component not found: ${componentId}`);

  const existingPrices = component.prices || [];

  // Build a map: configKey → { index in prices[], productUrl }
  const scrapeTargets = [];
  for (let i = 0; i < existingPrices.length; i++) {
    const entry = existingPrices[i];
    const configKey = resolveConfigKey(entry.storeName || entry.store);
    if (configKey && entry.productUrl) {
      scrapeTargets.push({ index: i, configKey, productUrl: entry.productUrl });
    }
  }

  if (scrapeTargets.length === 0) {
    console.warn(`[PriceService] No scrapeable retailer URLs found for "${component.name}".`);
    return existingPrices;
  }

  console.info(`[PriceService] Scraping ${scrapeTargets.length} retailers for "${component.name}"...`);

  // Scrape all retailers in parallel.
  const results = await Promise.allSettled(
    scrapeTargets.map(async (target) => {
      const scraped = await scrapeWithRetry(target.configKey, target.productUrl);
      return { ...target, scraped };
    }),
  );

  // Update prices array entries in-place with scraped data.
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.error('[PriceService] Unexpected settlement failure.', {
        reason: result.reason,
      });
      continue;
    }

    const { index, configKey, scraped } = result.value;
    const priceEntry = existingPrices[index];

    if (scraped.isValid) {
      priceEntry.price = scraped.price;
      priceEntry.currentPrice = scraped.price;
      priceEntry.inStock = scraped.availability !== 'Out of Stock';
      priceEntry.availability = scraped.availability;
      priceEntry.lastUpdated = scraped.lastUpdated;
    } else {
      // Keep the existing price but mark as stale with the error.
      priceEntry.lastUpdated = scraped.lastUpdated;
      // Don't overwrite a valid cached price — just update the timestamp.
      console.warn(`[PriceService] ${configKey} scrape failed, keeping cached price.`, {
        cachedPrice: priceEntry.price,
        error: scraped.error,
      });
    }
  }

  // Persist updates.
  component.prices = existingPrices;
  component.markModified('prices');
  await component.save();

  console.info(`[PriceService] Prices updated for "${component.name}".`, {
    retailers: scrapeTargets.length,
    componentId,
  });

  return component.prices;
}

/**
 * Gets cached prices for a component, refreshing if stale.
 *
 * @param {string} componentId — MongoDB ObjectId.
 * @param {{ forceRefresh?: boolean }} options
 * @returns {Promise<object[]>} — Prices array.
 */
export async function getPrices(componentId, options = {}) {
  const { forceRefresh = false } = options;

  if (forceRefresh) {
    return fetchLivePrices(componentId);
  }

  const component = await Component.findById(componentId).lean();
  if (!component) throw new Error(`Component not found: ${componentId}`);

  const existingPrices = component.prices || [];

  // Check if any tracked retailer's price is stale.
  const hasStaleEntries = existingPrices.some((entry) => {
    const configKey = resolveConfigKey(entry.storeName || entry.store);
    if (!configKey) return false;
    const config = RETAILER_CONFIG[configKey];
    return !isFresh(entry, config.ttlMinutes);
  });

  if (hasStaleEntries) {
    console.info(`[PriceService] Stale prices detected for component ${componentId}. Refreshing...`);
    return fetchLivePrices(componentId);
  }

  return existingPrices;
}

/**
 * Force-refreshes prices for all components that have retailer URLs.
 * Processes in batches to avoid overwhelming scrapers.
 *
 * @param {{ batchSize?: number, delayBetweenBatchesMs?: number }} options
 * @returns {Promise<{ succeeded: number, failed: number, total: number }>}
 */
export async function refreshAllPrices(options = {}) {
  const { batchSize = 3, delayBetweenBatchesMs = 5000 } = options;

  // Find components that have at least one price entry with a productUrl.
  const components = await Component.find({
    'prices.productUrl': { $exists: true, $ne: '' },
  })
    .select('_id name')
    .lean();

  console.info(`[PriceService] Bulk refresh starting for ${components.length} components.`);

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < components.length; i += batchSize) {
    const batch = components.slice(i, i + batchSize);

    await Promise.allSettled(
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

    // Pause between batches to be polite to retailers.
    if (i + batchSize < components.length) {
      await sleep(delayBetweenBatchesMs);
    }
  }

  console.info(`[PriceService] Bulk refresh complete.`, {
    succeeded,
    failed,
    total: components.length,
  });
  return { succeeded, failed, total: components.length };
}

export default { fetchLivePrices, getPrices, refreshAllPrices };
