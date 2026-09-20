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
