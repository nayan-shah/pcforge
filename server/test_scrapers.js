import { scrapePrimeAbgbOffers } from './src/services/scrapers/primeabgb/primeAbgbService.js';
import { scrapeVedantOffers } from './src/services/scrapers/vedant/vedantService.js';
import { scrapePcStudioOffers } from './src/services/scrapers/pcstudio/pcStudioService.js';
import { scrapeMdComputersOffers } from './src/services/scrapers/mdcomputers/mdComputersService.js';

const QUERY = 'ryzen 5 5600x';

console.log(`\n=== Testing scrapers with query: "${QUERY}" ===\n`);

const scrapers = [
  { name: 'PCStudio', fn: scrapePcStudioOffers },
  { name: 'PrimeABGB', fn: scrapePrimeAbgbOffers },
  { name: 'Vedant', fn: scrapeVedantOffers },
  { name: 'MDComputers', fn: scrapeMdComputersOffers },
];

for (const { name, fn } of scrapers) {
  try {
    console.log(`\n--- ${name} ---`);
    const startedAt = Date.now();
    const offers = await fn(QUERY);
    const elapsed = Date.now() - startedAt;
    console.log(`  ✅ ${offers.length} offers in ${elapsed}ms`);
    if (offers.length > 0) {
      const first = offers[0];
      console.log(`  First offer: ${first.productName} — ₹${first.price} (${first.availability})`);
    }
  } catch (err) {
    console.error(`  ❌ ${name} failed:`, err.message);
  }
}

console.log('\n=== Done ===');
