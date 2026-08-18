import { load } from 'cheerio';

const BASE_URL = 'https://www.primeabgb.com';
const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const absoluteUrl = (value) => {
  try { return value ? new URL(text(value), BASE_URL).href : ''; } catch { return ''; }
};
const price = (value) => {
  const parsed = Number(text(value).replace(/[^0-9.,]/g, '').replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function parsePrimeAbgbSearchHtml(html) {
  if (!text(html)) return [];

  try {
    const $ = load(html);
    const products = [];
    $('li.product, .products .product, .product-small').each((_, node) => {
      const card = $(node);
      const link = card.find('a.woocommerce-LoopProduct-link, a.woocommerce-loop-product__link, a[href*="/products/"]').first();
      const productName = text(card.find('.woocommerce-loop-product__title, .name, h2, h3').first().text()) || text(link.attr('title'));
      const productUrl = absoluteUrl(link.attr('href'));
      const image = card.find('img').first();
      const stockEl = card.find('.stock, .availability').first();
      let stock = 'In Stock';
      if (stockEl.hasClass('out-of-stock') || /out.of.stock|unavailable|sold.out/i.test(stockEl.text())) {
        stock = 'Out of Stock';
      } else if (stockEl.hasClass('in-stock') || /in.stock|available/i.test(stockEl.text())) {
        stock = 'In Stock';
      }
      if (!productName || !productUrl) return;

      products.push({
        product_name: productName,
        sale_price: price(
          card.find('ins .woocommerce-Price-amount').first().text()
          || card.find('.woocommerce-Price-amount').first().text()
        ),
        currency_code: 'INR',
        link: productUrl,
        image_url: absoluteUrl(image.attr('src') || image.attr('data-src') || image.attr('data-lazy-src')),
        stock,
      });
    });
    return products;
  } catch (error) {
    console.error('[PrimeABGB Parser] Failed to parse search HTML.', { message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}
