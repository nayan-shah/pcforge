import { load } from "cheerio";

const BASE_URL = "https://www.vedantcomputers.com";
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const absoluteUrl = (value) => {
  try { return value ? new URL(text(value), BASE_URL).href : ""; } catch { return ""; }
};
const parsePrice = (value) => {
  const parsed = Number(text(value).replace(/[^0-9.,]/g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
const parseStock = (card) => {
  const stockEl = card.find(".stock, .availability, .stock-status").first();
  const stockText = text(stockEl.text());
  if (/out.of.stock|unavailable|sold.out/i.test(stockText)) return "Out of Stock";
  if (/in.stock|available/i.test(stockText)) return "In Stock";
  // Vedant search pages rarely display stock status — assume available unless told otherwise
  return "In Stock";
};

export function parseVedantSearchHtml(html) {
  if (!text(html)) return [];
  try {
    const $ = load(html);
    const products = [];
    $(".product-layout, .product-thumb").each((_, node) => {
      const card = $(node);
      const link = card.find(".caption a, .product-name a, h4 a, a[href*=product_id]").first();
      const name = text(link.text()) || text(link.attr("title")) || text(card.find("strong, .name").first().text());
      const url = absoluteUrl(link.attr("href"));
      const image = card.find("img").first();
      if (!name || !url) return;
      products.push({
        name,
        price: parsePrice(card.find(".price-new").first().text()),
        currency: "INR",
        url,
        image: absoluteUrl(image.attr("src") || image.attr("data-src") || image.attr("data-original")),
        itemStatus: parseStock(card),
      });
    });
    return products;
  } catch (error) {
    console.error("[Vedant Parser] Failed to parse search HTML.", { message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}
