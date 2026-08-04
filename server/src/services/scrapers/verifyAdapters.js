import { mockRetailerResponses } from './mockResponses.js';
import normalizeAmazon from './amazon/normalizeAmazon.js';
import normalizeMDComputers from './mdcomputers/normalizeMDComputers.js';
import normalizePrimeABGB from './primeabgb/normalizePrimeABGB.js';
import normalizeVedant from './vedant/normalizeVedant.js';

const adapters = [
  ['Amazon', normalizeAmazon, mockRetailerResponses.amazon],
  ['MDComputers', normalizeMDComputers, mockRetailerResponses.mdcomputers],
  ['PrimeABGB', normalizePrimeABGB, mockRetailerResponses.primeabgb],
  ['Vedant', normalizeVedant, mockRetailerResponses.vedant],
];

const requiredKeys = [
  'storeName',
  'productName',
  'price',
  'currency',
  'productUrl',
  'image',
  'availability',
  'lastUpdated',
];

for (const [storeName, normalize, rawData] of adapters) {
  const normalized = normalize(rawData);
  const missingKeys = requiredKeys.filter((key) => normalized[key] === undefined || normalized[key] === null || String(normalized[key]).trim() === '');

  if (missingKeys.length > 0) {
    console.error(`[${storeName}] INVALID`, { missingKeys, normalized });
    process.exitCode = 1;
    continue;
  }

  console.log(`[${storeName}] OK`, JSON.stringify(normalized, null, 2));
}
