import { logInvalidOffer } from '../adapters/offerContract.js';
import normalizePrimeABGB from './normalizePrimeABGB.js';
import { parsePrimeAbgbSearchHtml } from './primeAbgbParser.js';
import { fetchPrimeAbgbSearchHtml } from './primeAbgbSearchClient.js';

export async function scrapePrimeAbgbOffers(query) {
  const html = await fetchPrimeAbgbSearchHtml(query);
  if (!html) return [];
  const products = parsePrimeAbgbSearchHtml(html);
  const lastUpdate = new Date().toISOString();
  const offers = products.map((product) => normalizePrimeABGB({ ...product, last_update: lastUpdate }));
  offers.filter((offer) => !offer.isValid).forEach((offer) => logInvalidOffer('PrimeABGB', 'Discarding invalid parsed offer.', offer));
  console.info('[PrimeABGB Service] Scrape completed.', { query, offers: offers.filter((offer) => offer.isValid).length });
  return offers.filter((offer) => offer.isValid);
}

export default scrapePrimeAbgbOffers;
