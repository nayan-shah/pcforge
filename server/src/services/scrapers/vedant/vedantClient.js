import { chromium } from 'playwright';

/**
 * Fetches the full HTML of a Vedant Computers product detail page using
 * headless Chromium (Playwright).
 *
 * Vedant uses a Journal3 OpenCart theme with lazy loading (lozad.js),
 * so product data is loaded via JavaScript and absent from static HTML.
 *
 * @param {string} productUrl — Direct URL to the product page on vedantcomputers.com
 * @returns {Promise<string | null>} — Full page HTML or null on failure.
 */

const TIMEOUT_MS = 30_000;

export async function fetchVedantPageHtml(productUrl) {
  const url = String(productUrl ?? '').trim();
  if (!url) throw new Error('A valid product URL is required.');

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

    // Remove Playwright fingerprints.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const page = await context.newPage();

    console.info('[Vedant Client] Navigating to product page.', { url });
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: TIMEOUT_MS,
    });

    if (!response || response.status() >= 400) {
      console.error('[Vedant Client] Bad HTTP response.', {
        status: response?.status(),
        url,
      });
      return null;
    }

    // Extra wait for lazy-loaded content (lozad.js).
    await page.waitForTimeout(2000);

    // Wait for OpenCart price element.
    await page
      .waitForSelector('.price-new, .product-price, #product-price, .price', {
        timeout: 10_000,
      })
      .catch(() => {
        console.warn('[Vedant Client] Price selector timed out — returning available HTML.');
      });

    const html = await page.content();
    console.info('[Vedant Client] HTML fetched successfully.', {
      url,
      htmlLength: html.length,
    });
    return html;
  } catch (error) {
    console.error('[Vedant Client] Failed.', {
      url,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
