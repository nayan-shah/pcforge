import { load } from 'cheerio';

const text = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

const parsePrice = (v) => {
  const n = Number(text(v).replace(/[^0-9.,]/g, '').replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Extracts stock status from a PCStudio WooCommerce product detail page.
 */
const getAvailability = ($) => {
  const el = $('.stock, .availability, [class*="stock-status"]').first();
  if (el.hasClass('out-of-stock') || /out.of.stock|unavailable|sold.out/i.test(el.text())) {
    return 'Out of Stock';
  }
  if (el.hasClass('in-stock') || /in.stock|available/i.test(el.text())) {
    return 'In Stock';
  }

  // WooCommerce "Add to cart" button presence implies in stock.
  const hasAddToCart = $('button.single_add_to_cart_button, .add_to_cart_button').length > 0;
  return hasAddToCart ? 'In Stock' : 'Unknown';
};

/**
 * Parses a PCStudio product detail page to extract ONLY price + availability.
 *
 * PCStudio uses WooCommerce. Product detail page price selectors:
 *   - Sale price: p.price ins .woocommerce-Price-amount
 *   - Regular:    p.price > .woocommerce-Price-amount
 *
 * @param {string} html — Full HTML of the product detail page.
 * @returns {{ price: number | null, availability: string }}
 */
export function parsePcStudioProductPrice(html) {
  if (!text(html)) {
    console.warn('[PCStudio Parser] Empty HTML payload received.');
    return { price: null, availability: 'Unknown' };
  }

  try {
    const $ = load(html);

    // Prefer discounted sale price, fall back to regular.
    const salePriceText = text($('p.price ins .woocommerce-Price-amount, .summary ins .woocommerce-Price-amount').first().text());
    const regularPriceText = text($('p.price > .woocommerce-Price-amount, .summary > .price .woocommerce-Price-amount').first().text());
    const anyPriceText = text($('.woocommerce-Price-amount').first().text());

    const price =
      parsePrice(salePriceText) ||
      parsePrice(regularPriceText) ||
      parsePrice(anyPriceText);

    const availability = getAvailability($);

    console.info('[PCStudio Parser] Parsed product page.', { price, availability });
    return { price, availability };
  } catch (error) {
    console.error('[PCStudio Parser] Failed to parse product page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { price: null, availability: 'Unknown' };
  }
}

/**
 * Parses a PCStudio search results page and returns an array of product objects.
 * Used by the search orchestrator flow.
 *
 * @param {string} html — Full HTML of the search results page.
 * @returns {Array<{ product_name: string, sale_price: number, currency_code: string, link: string, image_url: string, stock: string }>}
 */
export function parsePcStudioSearchHtml(html) {
  if (!text(html)) return [];

  try {
    const $ = load(html);
    const products = [];

    // PCStudio uses WooCommerce — product cards in search/archive pages.
    $('li.product, .product-grid-item, .products .product').each((_, el) => {
      const $el = $(el);
      const name = text($el.find('.woocommerce-loop-product__title, h2, .product-title a').first().text());
      const priceText = text($el.find('.price ins .woocommerce-Price-amount, .price .woocommerce-Price-amount').first().text());
      const link = $el.find('a.woocommerce-LoopProduct-link, a').first().attr('href') || '';
      const imageUrl = $el.find('img').first().attr('src') || '';

      const price = parsePrice(priceText);
      if (name && price) {
        products.push({ product_name: name, sale_price: price, currency_code: 'INR', link, image_url: imageUrl, stock: 'In Stock' });
      }
    });

    console.info('[PCStudio Parser] Parsed search results.', { count: products.length });
    return products;
  } catch (error) {
    console.error('[PCStudio Parser] Failed to parse search page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
