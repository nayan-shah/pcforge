import { load } from "cheerio";

const BASE_URL = "https://www.pcstudio.in";
const text = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const absoluteUrl = (v) => {
  try { return v ? new URL(text(v), BASE_URL).href : ""; } catch { return ""; }
};
const parsePrice = (v) => {
  const n = Number(text(v).replace(/[^0-9.,]/g, "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const parseStock = (card) => {
  const el = card.find(".stock, .availability").first();
  if (el.hasClass("out-of-stock") || /out.of.stock|unavailable|sold.out/i.test(el.text())) return "Out of Stock";
  return "In Stock";
};

export function parsePcStudioSearchHtml(html) {
  if (!text(html)) return [];
  try {
    const $ = load(html);
    const products = [];
    $("li.product, .products .product, ul.products li").each((_, node) => {
      const card = $(node);
      const link = card.find("a.woocommerce-LoopProduct-link, a.woocommerce-loop-product__link").first();
      const name = text(card.find(".woocommerce-loop-product__title, h2, h3").first().text()) || text(link.attr("title"));
      const url = absoluteUrl(link.attr("href"));
      const image = card.find("img").first();
      if (!name || !url) return;
      products.push({
        product_name: name,
        sale_price: parsePrice(
          card.find("ins .woocommerce-Price-amount").first().text() ||
          card.find(".woocommerce-Price-amount").first().text()
        ),
        currency_code: "INR",
        link: url,
        image_url: absoluteUrl(image.attr("src") || image.attr("data-src") || image.attr("data-lazy-src")),
        stock: parseStock(card),
      });
    });
    return products;
  } catch (err) {
    console.error("[PCStudio Parser] Failed.", { message: err instanceof Error ? err.message : String(err) });
    return [];
  }
}
