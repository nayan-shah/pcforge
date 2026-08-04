import { create } from 'axios';

const BASE_URL = 'https://www.mdcomputers.in';
const SEARCH_PATH = '/catalogsearch/result/';
const MAX_ATTEMPTS = 3;

const client = create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: {
    'User-Agent': 'PCForge price comparison bot (+https://pcforge.local)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
  },
  validateStatus: () => true,
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const buildSearchUrl = (query) => `${BASE_URL}${SEARCH_PATH}?q=${encodeURIComponent(query)}`;

const isRetryableStatus = (status) => status === 429 || status >= 500;

/**
 * Retrieves the MDComputers search document only. HTML parsing deliberately
 * lives in mdComputersParser.js so markup changes do not affect HTTP handling.
 */
export async function fetchMdComputersSearchHtml(query) {
  const searchQuery = String(query ?? '').trim();
  if (!searchQuery) {
    throw new Error('A valid search query is required.');
  }

  const url = buildSearchUrl(searchQuery);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await client.get(SEARCH_PATH, { params: { q: searchQuery } });

      if (response.status >= 200 && response.status < 300) {
        return String(response.data ?? '');
      }

      const retryable = isRetryableStatus(response.status);
      const retryAfterSeconds = Number(response.headers['retry-after']);
      const retryDelay = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1_000
        : 500 * (2 ** (attempt - 1));

      if (response.status === 429) {
        console.warn('[MDComputers Request] Rate limited.', { url, attempt, retryAfterSeconds });
      } else {
        console.error('[MDComputers Request] Unexpected HTTP status.', { url, status: response.status, attempt });
      }

      if (!retryable || attempt === MAX_ATTEMPTS) return null;
      await delay(retryDelay);
    } catch (error) {
      console.error('[MDComputers Request] Network request failed.', {
        url,
        attempt,
        message: error instanceof Error ? error.message : String(error),
      });

      if (attempt === MAX_ATTEMPTS) return null;
      await delay(500 * (2 ** (attempt - 1)));
    }
  }

  return null;
}
