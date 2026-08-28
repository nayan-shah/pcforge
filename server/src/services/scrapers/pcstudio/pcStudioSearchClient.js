import { chromium } from "playwright";

const BASE_URL = "https://www.pcstudio.in";
const TIMEOUT_MS = 30_000;

/**
 * Uses a headless Chromium browser to fetch PCStudio search results.
 * Switched from axios because the site was timing out on plain HTTP requests.
 */
export async function fetchPcStudioSearchHtml(query) {
  const searchQuery = String(query ?? "").trim();
  if (!searchQuery) throw new Error("A valid search query is required.");

  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      locale: "en-IN",
      extraHTTPHeaders: {
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    // Remove Playwright fingerprints
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await context.newPage();
    const url = `${BASE_URL}/?s=${encodeURIComponent(searchQuery)}&post_type=product`;

    console.info("[PCStudio Playwright] Navigating.", { url });
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: TIMEOUT_MS,
    });

    if (!response || response.status() >= 400) {
      console.error("[PCStudio Playwright] Bad HTTP response.", {
        status: response?.status(),
        url,
      });
      return null;
    }

    // Wait for WooCommerce product cards
    await page.waitForTimeout(2000);
    await page
      .waitForSelector("li.product, .products .product, ul.products li", {
        timeout: 10_000,
      })
      .catch(() => {
        console.warn("[PCStudio Playwright] Product selector timed out — returning available HTML.");
      });

    const html = await page.content();
    console.info("[PCStudio Playwright] HTML fetched successfully.", {
      query: searchQuery,
      htmlLength: html.length,
    });
    return html;
  } catch (error) {
    console.error("[PCStudio Playwright] Failed.", {
      query: searchQuery,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
