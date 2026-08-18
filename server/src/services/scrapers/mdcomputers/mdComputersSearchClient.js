import { chromium } from "playwright";

/**
 * Uses a headless Chromium browser to fetch MDComputers search results,
 * bypassing the 403 block that axios receives.
 *
 * Falls back gracefully — returns null on any failure so the
 * calling service can handle it without crashing the orchestrator.
 */

const BASE_URL = "https://www.mdcomputers.in";
const SEARCH_PATH = "/catalogsearch/result/";
const TIMEOUT_MS = 30_000;

export async function fetchMdComputersSearchHtml(query) {
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

    // Remove Playwright fingerprints that websites use to detect headless mode
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await context.newPage();
    const url = `${BASE_URL}${SEARCH_PATH}?q=${encodeURIComponent(searchQuery)}`;

    console.info("[MDComputers Playwright] Navigating.", { url });
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: TIMEOUT_MS,
    });

    if (!response || response.status() >= 400) {
      console.error('[MDComputers Playwright] Bad HTTP response.', {
        status: response?.status(),
        url,
      });
      return null;
    }

    // Extra wait for JS-rendered product grid
    await page.waitForTimeout(2000);

    // Wait for the custom theme product cards
    await page
      .waitForSelector('.product-grid-item, .product-entities-title', {
        timeout: 10_000,
      })
      .catch(() => {
        console.warn('[MDComputers Playwright] Product grid selector timed out — returning available HTML.');
      });

    const html = await page.content();
    console.info("[MDComputers Playwright] HTML fetched successfully.", {
      query: searchQuery,
      htmlLength: html.length,
    });
    return html;
  } catch (error) {
    console.error("[MDComputers Playwright] Failed.", {
      query: searchQuery,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

export const buildSearchUrl = (query) =>
  `${BASE_URL}${SEARCH_PATH}?q=${encodeURIComponent(query)}`;
