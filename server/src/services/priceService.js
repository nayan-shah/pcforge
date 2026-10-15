import Component from '../models/Component.js';
import { scrapeMdComputersOffers } from './scrapers/mdcomputers/mdComputersService.js';
import { fetchMdComputersPageHtml } from './scrapers/mdcomputers/mdComputersClient.js';
import { parseMdComputersProductPrice } from './scrapers/mdcomputers/mdComputersParser.js';
import { scrapeVedantOffers } from './scrapers/vedant/vedantService.js';
import { fetchVedantPageHtml } from './scrapers/vedant/vedantClient.js';
import { parseVedantProductPrice } from './scrapers/vedant/vedantParser.js';
import { scrapePrimeAbgbOffers } from './scrapers/primeabgb/primeAbgbService.js';
import { fetchPrimeAbgbPageHtml } from './scrapers/primeabgb/primeAbgbClient.js';
import { parsePrimeAbgbProductPrice } from './scrapers/primeabgb/primeAbgbParser.js';
import { scrapePcStudioOffers } from './scrapers/pcstudio/pcStudioService.js';
import { fetchPcStudioPageHtml } from './scrapers/pcstudio/pcStudioClient.js';
import { parsePcStudioProductPrice } from './scrapers/pcstudio/pcStudioParser.js';
import {
  normalizeAvailability,
  normalizeRetailerPrice,
  RetailerFetchError,
} from './scrapers/retailerMarkup.js';
import {
  getProductSearchQueries,
  isDirectProductUrl,
  isExactProductTitle,
} from './scrapers/exactProductMatch.js';

const RETAILER_CONFIG = {
  MDComputers: {
    ttlMinutes: 60,
    fetchHtml: fetchMdComputersPageHtml,
    parsePrice: parseMdComputersProductPrice,
    searchOffers: scrapeMdComputersOffers,
    retries: 3,
    baseUrl: 'https://www.mdcomputers.in',
  },
  Vedant: {
    ttlMinutes: 30,
    fetchHtml: fetchVedantPageHtml,
    parsePrice: parseVedantProductPrice,
    searchOffers: scrapeVedantOffers,
    retries: 3,
    baseUrl: 'https://www.vedantcomputers.com',
  },
  PrimeABGB: {
    ttlMinutes: 60,
    fetchHtml: fetchPrimeAbgbPageHtml,
    parsePrice: parsePrimeAbgbProductPrice,
    searchOffers: scrapePrimeAbgbOffers,
    retries: 3,
    baseUrl: 'https://www.primeabgb.com',
  },
  PCStudio: {
    ttlMinutes: 30,
    fetchHtml: fetchPcStudioPageHtml,
    parsePrice: parsePcStudioProductPrice,
    searchOffers: scrapePcStudioOffers,
    retries: 3,
    baseUrl: 'https://www.pcstudio.in',
  },
};

const REQUEST_DELAY_MS = 1000;
const RETRY_BASE_DELAY_MS = 1000;
const FAILED_FETCH_COOLDOWN_MS = 15 * 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveConfigKey = (storeName) => {
  if (!storeName) return null;
  const lower = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return (
    Object.keys(RETAILER_CONFIG).find((key) =>
      lower.includes(key.toLowerCase().replace(/[^a-z0-9]/g, '')),
    ) ?? null
  );
};

const describeFetchFailure = (error) => {
  const statusCode = error?.statusCode;
  if (statusCode === 404 || statusCode === 410)
    return `bad URL: retailer returned HTTP ${statusCode}`;
  if (statusCode === 403 || statusCode === 429)
    return `blocked: retailer returned HTTP ${statusCode}`;
  if (statusCode >= 400) return `fetch failed: retailer returned HTTP ${statusCode}`;
  return error instanceof Error ? error.message : String(error);
};

const shouldRetry = (error) => {
  if (error instanceof RetailerFetchError && !error.statusCode) return false;
  return !error?.statusCode || error.statusCode === 429 || error.statusCode >= 500;
};

const fetchProduct = async (configKey, component, productUrl, trustedSearchTitle = '') => {
  const config = RETAILER_CONFIG[configKey];
  let lastError = null;

  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      const html = await config.fetchHtml(productUrl);
      if (!html) throw new Error('Empty HTML response from retailer.');

      const result = config.parsePrice(html) ?? {};
      const price = normalizeRetailerPrice(result.price);
      const productName = result.productName || trustedSearchTitle;

      if (
        /welcome back|captcha|access denied|verify (?:you are|your)|security check/i.test(
          productName,
        )
      ) {
        throw new RetailerFetchError('blocked: retailer served an access or challenge page');
      }
      if (!productName) {
        throw new Error('parse failure: product title was not present in the page markup');
      }
      if (!isExactProductTitle(component.name, component.brand, productName)) {
        throw new RetailerFetchError(
          'bad URL: product title does not match the exact component model',
        );
      }
      if (!price) {
        throw new Error('parse failure: no positive product price was found');
      }

      const availability = normalizeAvailability(result.availability);
      return {
        price,
        availability,
        inStock:
          availability === 'In Stock' ? true : availability === 'Out of Stock' ? false : null,
        lastUpdated: new Date(),
        productUrl,
        error: null,
      };
    } catch (error) {
      lastError = error;
      if (attempt >= config.retries || !shouldRetry(error)) break;
      const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(`[PriceService] Retrying ${configKey} in ${delay}ms.`, {
        productUrl,
        error: describeFetchFailure(error),
      });
      await sleep(delay);
    }
  }

  return { error: describeFetchFailure(lastError) };
};

const asDirectUrl = (configKey, config, candidateUrl) => {
  try {
    const absoluteUrl = new URL(candidateUrl, config.baseUrl).toString();
    return isDirectProductUrl(configKey, absoluteUrl) ? absoluteUrl : null;
  } catch {
    return null;
  }
};

const fetchSearchOffers = async (configKey, config, query) => {
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      return await config.searchOffers(query);
    } catch (error) {
      if (attempt >= config.retries || !shouldRetry(error)) throw error;
      const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(`[PriceService] Retrying ${configKey} search in ${delay}ms.`, {
        query,
        error: describeFetchFailure(error),
      });
      await sleep(delay);
    }
  }
  throw new Error(`All ${configKey} search attempts completed without a result.`);
};

const findExactSearchResult = async (configKey, component) => {
  const config = RETAILER_CONFIG[configKey];
  const queries = getProductSearchQueries(component.name);

  for (let index = 0; index < queries.length; index++) {
    if (index > 0) await sleep(REQUEST_DELAY_MS);
    const offers = await fetchSearchOffers(configKey, config, queries[index]);
    const match = offers
      .filter((offer) => isExactProductTitle(component.name, component.brand, offer.productName))
      .map((offer) => ({
        offer,
        productUrl: asDirectUrl(configKey, config, offer.productUrl),
      }))
      .find((candidate) => candidate.productUrl);
    if (match) return match;
  }
  return null;
};

const scrapeWithRecovery = async (configKey, component, productUrl) => {
  const originalUrl = String(productUrl ?? '').trim();
  let initialError = 'bad URL: no product URL was stored';

  if (isDirectProductUrl(configKey, originalUrl)) {
    const directResult = await fetchProduct(configKey, component, originalUrl);
    if (!directResult.error) return directResult;
    initialError = directResult.error;
  } else if (originalUrl) {
    initialError = 'bad URL: stored URL is not a direct product page';
  }

  try {
    await sleep(REQUEST_DELAY_MS);
    const match = await findExactSearchResult(configKey, component);
    if (!match) {
      console.warn(
        `[PriceService] No exact-model URL found for ${configKey} "${component.name}".`,
        {
          productUrl: originalUrl || null,
          reason: `${initialError}; no exact-model search result was found`,
        },
      );
      return {
        error: `${initialError}; no exact-model search result was found`,
      };
    }

    console.info(
      `[PriceService] Found an exact-model ${configKey} product URL candidate for "${component.name}".`,
      {
        oldUrl: originalUrl || null,
        newUrl: match.productUrl,
        matchedTitle: match.offer.productName,
      },
    );

    await sleep(REQUEST_DELAY_MS);
    const verifiedResult = await fetchProduct(
      configKey,
      component,
      match.productUrl,
      match.offer.productName,
    );
    const candidateUrlFailed =
      verifiedResult.error?.includes('title does not match') ||
      verifiedResult.error?.includes('HTTP 404') ||
      verifiedResult.error?.includes('HTTP 410');
    if (candidateUrlFailed) {
      console.warn(
        `[PriceService] Could not verify the ${configKey} URL candidate for "${component.name}".`,
        {
          oldUrl: originalUrl || null,
          candidateUrl: match.productUrl,
          reason: verifiedResult.error,
        },
      );
    }

    return {
      ...verifiedResult,
      productUrl: candidateUrlFailed ? null : match.productUrl,
    };
  } catch (error) {
    console.warn(
      `[PriceService] Exact-model URL search failed for ${configKey} "${component.name}".`,
      {
        productUrl: originalUrl || null,
        reason: describeFetchFailure(error),
      },
    );
    return {
      error: `${initialError}; exact-model search failed: ${describeFetchFailure(error)}`,
    };
  }
};

const hasPositivePrice = (entry) => {
  return [entry?.price, entry?.currentPrice].some((value) => {
    const price = Number(value);
    return Number.isFinite(price) && price > 0;
  });
};

const hasRecentFailedAttempt = (entry) => {
  if (!entry?.lastFetchError || !entry?.lastAttemptAt) return false;
  const age = Date.now() - new Date(entry.lastAttemptAt).getTime();
  return age >= 0 && age < FAILED_FETCH_COOLDOWN_MS;
};

const isFresh = (entry, ttlMinutes) => {
  if (!hasPositivePrice(entry) || entry.stale || !entry.lastUpdated) return false;
  const age = Date.now() - new Date(entry.lastUpdated).getTime();
  return age >= 0 && age < ttlMinutes * 60 * 1000;
};

export async function fetchLivePrices(componentId) {
  const component = await Component.findById(componentId);
  if (!component) throw new Error(`Component not found: ${componentId}`);

  const existingPrices = component.prices || [];
  const scrapeTargets = existingPrices
    .map((entry, index) => ({
      index,
      configKey: resolveConfigKey(entry.storeName || entry.store),
      productUrl: entry.productUrl,
    }))
    .filter((target) => target.configKey);

  for (let index = 0; index < scrapeTargets.length; index++) {
    const target = scrapeTargets[index];
    if (index > 0) await sleep(REQUEST_DELAY_MS);

    const entry = existingPrices[target.index];
    const scraped = await scrapeWithRecovery(target.configKey, component, target.productUrl);
    entry.lastAttemptAt = new Date();

    if (scraped.price && scraped.price > 0) {
      entry.price = scraped.price;
      entry.currentPrice = scraped.price;
      entry.inStock = scraped.inStock;
      entry.availability = scraped.availability;
      entry.lastUpdated = scraped.lastUpdated;
      entry.stale = false;
      entry.lastFetchError = null;
    } else {
      const lastKnownGoodPrice = [entry.price, entry.currentPrice]
        .map(Number)
        .find((price) => Number.isFinite(price) && price > 0);
      if (lastKnownGoodPrice == null) {
        entry.price = null;
        entry.currentPrice = null;
        entry.lastUpdated = null;
      } else {
        entry.price = lastKnownGoodPrice;
        entry.currentPrice = lastKnownGoodPrice;
      }
      entry.inStock = null;
      entry.availability = 'Unknown';
      entry.stale = true;
      entry.lastFetchError = scraped.error || 'parse failure: no valid price was returned';
      console.warn(`[PriceService] ${target.configKey} refresh failed for "${component.name}".`, {
        productUrl: target.productUrl,
        reason: entry.lastFetchError,
      });
    }

    if (scraped.productUrl) entry.productUrl = scraped.productUrl;
    else if (scraped.error?.includes('no exact-model search result')) {
      console.warn(
        `[PriceService] No exact-model URL found for ${target.configKey} "${component.name}".`,
        {
          productUrl: target.productUrl || null,
          reason: scraped.error,
        },
      );
    }
  }

  component.prices = existingPrices;
  component.markModified('prices');
  await component.save();
  return component.prices;
}

export async function getPrices(componentId, options = {}) {
  const { forceRefresh = false } = options;
  const component = await Component.findById(componentId).lean();
  if (!component) throw new Error(`Component not found: ${componentId}`);

  const existingPrices = component.prices || [];
  const shouldRefresh =
    forceRefresh ||
    existingPrices.some((entry) => {
      const configKey = resolveConfigKey(entry.storeName || entry.store);
      if (!configKey || isFresh(entry, RETAILER_CONFIG[configKey].ttlMinutes)) return false;
      return !hasRecentFailedAttempt(entry);
    });

  return shouldRefresh ? fetchLivePrices(componentId) : existingPrices;
}

export async function refreshAllPrices(options = {}) {
  const { limit = 0 } = options;
  const query = Component.find({
    'prices.0': { $exists: true },
  })
    .select('_id name category prices')
    .sort({ _id: 1 });
  if (limit > 0) query.limit(limit);
  const components = await query.lean();

  const perRetailer = Object.fromEntries(
    Object.keys(RETAILER_CONFIG).map((store) => [store, { fetched: 0, failed: 0 }]),
  );
  const unavailable = [];

  for (let index = 0; index < components.length; index++) {
    const component = components[index];
    try {
      const updatedPrices = await fetchLivePrices(component._id);
      for (const entry of updatedPrices) {
        const configKey = resolveConfigKey(entry.storeName || entry.store);
        if (!configKey) continue;
        if (hasPositivePrice(entry) && !entry.stale) {
          perRetailer[configKey].fetched++;
        } else {
          perRetailer[configKey].failed++;
          if (!hasPositivePrice(entry)) {
            unavailable.push({
              component: component.name,
              retailer: configKey,
              reason: entry.lastFetchError || 'parse failure: no positive price is stored',
            });
          }
        }
      }
    } catch (error) {
      for (const entry of component.prices ?? []) {
        const configKey = resolveConfigKey(entry.storeName || entry.store);
        if (!configKey) continue;
        perRetailer[configKey].failed++;
        unavailable.push({
          component: component.name,
          retailer: configKey,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }
    if (index + 1 < components.length) await sleep(REQUEST_DELAY_MS);
  }

  return { componentsProcessed: components.length, perRetailer, unavailable };
}

export default { fetchLivePrices, getPrices, refreshAllPrices };
