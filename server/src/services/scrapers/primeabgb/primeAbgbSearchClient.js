import { chromium } from 'playwright';

const BASE_URL = 'https://www.primeabgb.com';
const TIMEOUT_MS = 30_000;

/**
 * Uses a headless Chromium browser to fetch PrimeABGB search results.
 * The site renders product cards via JavaScript (LiteSpeed cache + deferred JS),
 * so plain axios/HTTP requests return no product data.
 */
export async function fetchPrimeAbgbSearchHtml(query) {
  const searchQuery = String(query ?? '').trim();
  if (!searchQuery) throw new Error('A valid search query is required.');

  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-IN',
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    // Remove Playwright fingerprints
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const page = await context.newPage();
    const url = `${BASE_URL}/?s=${encodeURIComponent(searchQuery)}&post_type=product`;

    console.info('[PrimeABGB Playwright] Navigating.', { url });
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: TIMEOUT_MS,
    });

    if (!response || response.status() >= 400) {
      console.error('[PrimeABGB Playwright] Bad HTTP response.', {
        status: response?.status(),
        url,
      });
      return null;
    }

    // Extra wait for JS-rendered content (LiteSpeed deferred scripts)
    await page.waitForTimeout(2000);

    // Wait for WooCommerce product cards to appear
    await page
      .waitForSelector('li.product, .products .product, .product-small', {
        timeout: 10_000,
      })
      .catch(() => {
        console.warn('[PrimeABGB Playwright] Product selector timed out — returning available HTML.');
      });

    const html = await page.content();
    console.info('[PrimeABGB Playwright] HTML fetched successfully.', {
      query: searchQuery,
      htmlLength: html.length,
    });
    return html;
  } catch (error) {
    console.error('[PrimeABGB Playwright] Failed.', {
      query: searchQuery,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
