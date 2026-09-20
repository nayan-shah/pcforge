import { chromium } from 'playwright';

/**
 * Fetches the full HTML of an MDComputers product detail page using
 * headless Chromium (Playwright).
 *
 * MDComputers blocks plain axios requests with 403, so a real browser
 * context with anti-fingerprinting is required.
 *
 * @param {string} productUrl — Direct URL to the product page on mdcomputers.in
 * @returns {Promise<string | null>} — Full page HTML or null on failure.
 */

const TIMEOUT_MS = 30_000;

export async function fetchMdComputersPageHtml(productUrl) {
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

    // Remove Playwright fingerprints that websites use to detect headless mode.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const page = await context.newPage();

    console.info('[MDComputers Client] Navigating to product page.', { url });
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: TIMEOUT_MS,
    });

    if (!response || response.status() >= 400) {
      console.error('[MDComputers Client] Bad HTTP response.', {
        status: response?.status(),
        url,
      });
      return null;
    }

    // Wait for price element to render.
    await page
      .waitForSelector('.price .amount, .woocommerce-Price-amount, .amount', {
        timeout: 10_000,
      })
      .catch(() => {
        console.warn('[MDComputers Client] Price selector timed out — returning available HTML.');
      });

    const html = await page.content();
    console.info('[MDComputers Client] HTML fetched successfully.', {
      url,
      htmlLength: html.length,
    });
    return html;
  } catch (error) {
    console.error('[MDComputers Client] Failed.', {
      url,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
