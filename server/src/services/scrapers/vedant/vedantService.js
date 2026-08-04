import { logInvalidOffer } from '../adapters/offerContract.js';
import normalizeVedant from './normalizeVedant.js';
import { parseVedantSearchHtml } from './vedantParser.js';
import { fetchVedantSearchHtml } from './vedantSearchClient.js';

export async function scrapeVedantOffers(query) {
  const html = await fetchVedantSearchHtml(query);
  if (!html) return [];
  const products = parseVedantSearchHtml(html);
  const updated = new Date().toISOString();
  const offers = products.map((product) => normalizeVedant({ ...product, updated }));
  offers.filter((offer) => !offer.isValid).forEach((offer) => logInvalidOffer('Vedant', 'Discarding invalid parsed offer.', offer));
  console.info('[Vedant Service] Scrape completed.', { query, offers: offers.filter((offer) => offer.isValid).length });
  return offers.filter((offer) => offer.isValid);
}

export default scrapeVedantOffers;
