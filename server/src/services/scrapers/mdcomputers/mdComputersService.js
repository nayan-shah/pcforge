import { logInvalidOffer } from '../adapters/offerContract.js';
import { fetchMdComputersSearchHtml } from './mdComputersSearchClient.js';
import { parseMdComputersSearchHtml } from './mdComputersParser.js';
import normalizeMDComputers from './normalizeMDComputers.js';

/**
 * Fetches live MDComputers results and returns valid standardized Offer objects.
 */
export async function scrapeMdComputersOffers(query) {
  const searchQuery = String(query ?? '').trim();
  if (!searchQuery) {
    throw new Error('A valid search query is required.');
  }

  const html = await fetchMdComputersSearchHtml(searchQuery);
  if (!html) return [];

  const rawProducts = parseMdComputersSearchHtml(html);
  if (rawProducts.length === 0) {
    console.info('[MDComputers Service] No search results found.', { query: searchQuery });
    return [];
  }

  const fetchedAt = new Date().toISOString();
  return rawProducts.reduce((offers, product) => {
    const offer = normalizeMDComputers({ ...product, fetchedAt });
    if (!offer.isValid) {
      logInvalidOffer('MDComputers', 'Discarding product with missing or invalid fields.', offer);
      return offers;
    }

    offers.push(offer);
    return offers;
  }, []);
}

export default scrapeMdComputersOffers;
