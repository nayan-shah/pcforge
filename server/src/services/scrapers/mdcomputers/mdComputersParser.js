import { load } from "cheerio";

const BASE_URL = "https://www.mdcomputers.in";

const cleanText = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

const toAbsoluteUrl = (v) => {
  const url = cleanText(v);
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  try { return new URL(url, BASE_URL).href; } catch { return ""; }
};

export const parseMdComputersPrice = (raw) => {
  const value = cleanText(raw).replace(/[^0-9.,]/g, "");
  if (!value) return null;
  const price = Number(value.replace(/,/g, ""));
  return Number.isFinite(price) && price > 0 ? price : null;
};

const getImageUrl = (card) => {
  const img = card.find("img.attachment-large, .product-image-link img, img").first();
  return toAbsoluteUrl(
    img.attr("src") || img.attr("data-src") || img.attr("data-original") || img.attr("data-lazy-src")
  );
};

const getAvailability = (card) => {
  // MDComputers' custom theme doesn't show stock on search — default In Stock
  // unless an "out-of-stock" class or text is explicitly present
  const cls = card.attr("class") || "";
  if (/out.of.stock|outofstock/i.test(cls)) return "Out of Stock";
  const statusText = cleanText(card.find("[class*=stock], [class*=availability]").first().text());
  if (/out.of.stock|unavailable|sold.out/i.test(statusText)) return "Out of Stock";
  return "In Stock";
};

/**
 * Parses the MDComputers search result HTML rendered by Playwright.
 *
 * The site uses a custom WordPress/WooCommerce-style theme with these classes:
 *  - Container:  .product-grid-item
 *  - Name:       h3.product-entities-title a
 *  - Link:       a.product-image-link   OR   h3.product-entities-title a
 *  - Image:      img.attachment-large
 *  - Sale price: span.ins .amount
 *  - Old price:  span.del .amount
 */
export function parseMdComputersSearchHtml(html) {
  if (!cleanText(html)) {
    console.warn("[MDComputers Parser] Empty HTML payload received.");
    return [];
  }

  try {
    const $ = load(html);
    const products = [];

    $(".product-grid-item").each((_, node) => {
      const card = $(node);

      // Name and URL
      const nameLink = card.find("h3.product-entities-title a, .product-entities-title a").first();
      const imageLink = card.find("a.product-image-link").first();
      const name = cleanText(nameLink.text()) || cleanText(imageLink.attr("title")) || cleanText(imageLink.find("img").attr("alt"));
      const productUrl = toAbsoluteUrl(nameLink.attr("href") || imageLink.attr("href"));

      if (!name || !productUrl) {
        console.warn("[MDComputers Parser] Skipping card with missing name or URL.");
        return;
      }

      // Price: prefer sale price (ins), fall back to any .amount
      const salePriceText = cleanText(card.find("span.ins .amount, .ins .amount").first().text());
      const regularPriceText = cleanText(card.find("span.del .amount, .del .amount").first().text());
      const anyPriceText = cleanText(card.find(".price .amount, .amount").first().text());

      const currentPrice =
        parseMdComputersPrice(salePriceText) ||
        parseMdComputersPrice(regularPriceText) ||
        parseMdComputersPrice(anyPriceText);

      products.push({
        name,
        currentPrice,
        productUrl,
        imageUrl: getImageUrl(card),
        stockStatus: getAvailability(card),
        currency: "INR",
      });
    });

    console.info(`[MDComputers Parser] Parsed ${products.length} product cards.`);
    return products;
  } catch (error) {
    console.error("[MDComputers Parser] Failed to parse search HTML.", {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
