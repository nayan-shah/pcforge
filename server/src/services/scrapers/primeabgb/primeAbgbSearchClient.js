import { create } from 'axios';

const BASE_URL = 'https://www.primeabgb.com';
const MAX_ATTEMPTS = 3;

const client = create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Upgrade-Insecure-Requests': '1',
  },
  validateStatus: () => true,
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function fetchPrimeAbgbSearchHtml(query) {
  const searchQuery = String(query ?? '').trim();
  if (!searchQuery) throw new Error('A valid search query is required.');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await client.get('/', { params: { s: searchQuery, post_type: 'product' } });
      if (response.status >= 200 && response.status < 300) return String(response.data ?? '');

      const retryable = response.status === 429 || response.status >= 500;
      console[response.status === 429 ? 'warn' : 'error']('[PrimeABGB Request] Request failed.', {
        status: response.status, attempt, query: searchQuery,
      });
      if (!retryable || attempt === MAX_ATTEMPTS) return null;
      await delay(500 * (2 ** (attempt - 1)));
    } catch (error) {
      console.error('[PrimeABGB Request] Network request failed.', {
        attempt, query: searchQuery, message: error instanceof Error ? error.message : String(error),
      });
      if (attempt === MAX_ATTEMPTS) return null;
      await delay(500 * (2 ** (attempt - 1)));
    }
  }

  return null;
}
