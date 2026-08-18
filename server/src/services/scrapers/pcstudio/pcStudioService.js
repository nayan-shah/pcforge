import { logInvalidOffer } from "../adapters/offerContract.js";
import { fetchPcStudioSearchHtml } from "./pcStudioSearchClient.js";
import { parsePcStudioSearchHtml } from "./pcStudioParser.js";
import normalizePcStudio from "./normalizePcStudio.js";

export async function scrapePcStudioOffers(query) {
  const searchQuery = String(query ?? "").trim();
  if (!searchQuery) throw new Error("A valid search query is required.");

  const html = await fetchPcStudioSearchHtml(searchQuery);
  if (!html) return [];

  const rawProducts = parsePcStudioSearchHtml(html);
  if (rawProducts.length === 0) {
    console.info("[PCStudio Service] No search results found.", { query: searchQuery });
    return [];
  }

  const fetchedAt = new Date().toISOString();
  return rawProducts.reduce((offers, product) => {
    const offer = normalizePcStudio({ ...product, last_update: fetchedAt });
    if (!offer.isValid) {
      logInvalidOffer("PCStudio", "Discarding product with missing or invalid fields.", offer);
      return offers;
    }
    offers.push(offer);
    return offers;
  }, []);
}

export default scrapePcStudioOffers;
