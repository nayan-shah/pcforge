import { scrapeMdComputersOffers } from './scrapers/mdcomputers/mdComputersService.js';
import { scrapePrimeAbgbOffers } from './scrapers/primeabgb/primeAbgbService.js';
import { scrapeVedantOffers } from './scrapers/vedant/vedantService.js';

const RETAILERS = [
  { name: 'MDComputers', scrape: scrapeMdComputersOffers },
  { name: 'PrimeABGB', scrape: scrapePrimeAbgbOffers },
  { name: 'Vedant', scrape: scrapeVedantOffers },
];

const KNOWN_BRANDS = ['amd', 'asus', 'cooler master', 'corsair', 'deepcool', 'gigabyte', 'intel', 'kingston', 'msi', 'nvidia', 'sapphire', 'zotac'];
const STOP_WORDS = new Set(['and', 'edition', 'for', 'gb', 'graphics', 'in', 'of', 'the', 'with']);
const availabilityRank = (availability) => (/out of stock|unavailable|sold out/i.test(availability) ? 1 : 0);
const tokenize = (name) => String(name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((token) => token && !STOP_WORDS.has(token));
const similarity = (left, right) => {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return intersection / Math.max(1, new Set([...leftTokens, ...rightTokens]).size);
};
const brandOf = (name) => KNOWN_BRANDS.find((brand) => String(name).toLowerCase().includes(brand)) || '';
const modelTokens = (name) => tokenize(name).filter((token) => /\d/.test(token));
const sameProduct = (left, right) => {
  const leftBrand = brandOf(left.productName);
  const rightBrand = brandOf(right.productName);
  if (leftBrand && rightBrand && leftBrand !== rightBrand) return false;
  const leftModels = modelTokens(left.productName);
  const rightModels = new Set(modelTokens(right.productName));
  return leftModels.some((token) => rightModels.has(token)) || similarity(left.productName, right.productName) >= 0.78;
};

const sortOffers = (offers) => [...offers].sort((left, right) => (
  Number(left.price) - Number(right.price)
  || availabilityRank(left.availability) - availabilityRank(right.availability)
  || new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime()
));

// Retains comparable offers from different stores, while removing repeated cards
// from the same retailer for the same underlying product.
const deduplicateOffers = (offers) => offers.reduce((unique, offer) => {
  const duplicateIndex = unique.findIndex((candidate) => candidate.storeName === offer.storeName && sameProduct(candidate, offer));
  if (duplicateIndex === -1) {
    unique.push(offer);
  } else if (sortOffers([unique[duplicateIndex], offer])[0] === offer) {
    unique[duplicateIndex] = offer;
  }
  return unique;
}, []);

export async function searchRetailers(query) {
  const searchQuery = String(query ?? '').trim();
  if (!searchQuery) throw new Error('A valid search query is required.');

  const startedAt = Date.now();
  const results = await Promise.allSettled(RETAILERS.map(async (retailer) => {
    const retailerStartedAt = Date.now();
    const offers = await retailer.scrape(searchQuery);
    console.info('[Search Orchestrator] Scraper completed.', { retailer: retailer.name, durationMs: Date.now() - retailerStartedAt, offers: offers.length });
    return { retailer: retailer.name, offers };
  }));

  const successful = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') successful.push(...result.value.offers);
    else console.error('[Search Orchestrator] Scraper failed.', { retailer: RETAILERS[index].name, message: result.reason instanceof Error ? result.reason.message : String(result.reason) });
  });

  const offers = sortOffers(deduplicateOffers(successful));
  console.info('[Search Orchestrator] Search completed.', { query: searchQuery, durationMs: Date.now() - startedAt, totalOffers: offers.length });
  return {
    query: searchQuery,
    totalStores: new Set(offers.map((offer) => offer.storeName)).size,
    totalOffers: offers.length,
    cheapestOffer: offers[0] ?? null,
    offers,
  };
}

export default searchRetailers;
