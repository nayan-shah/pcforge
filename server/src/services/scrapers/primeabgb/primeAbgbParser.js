import { load } from 'cheerio';

const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const parsePrice = (value) => {
  const parsed = Number(text(value).replace(/[^0-9.,]/g, '').replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Extracts stock status from a PrimeABGB WooCommerce product detail page.
 */
const getAvailability = ($) => {
  const stockEl = $('.stock, .availability, [class*="stock-status"]').first();
  if (stockEl.hasClass('out-of-stock') || /out.of.stock|unavailable|sold.out/i.test(stockEl.text())) {
    return 'Out of Stock';
  }
  if (stockEl.hasClass('in-stock') || /in.stock|available/i.test(stockEl.text())) {
    return 'In Stock';
  }

  // WooCommerce "Add to cart" button presence implies in stock.
  const hasAddToCart = $('button.single_add_to_cart_button, .add_to_cart_button').length > 0;
  return hasAddToCart ? 'In Stock' : 'Unknown';
};

/**
 * Parses a PrimeABGB product detail page to extract ONLY price + availability.
 *
 * PrimeABGB uses WooCommerce. Product detail page price selectors:
 *   - Sale price: p.price ins .woocommerce-Price-amount
 *   - Regular:    p.price > .woocommerce-Price-amount
 *
 * @param {string} html — Full HTML of the product detail page.
 * @returns {{ price: number | null, availability: string }}
 */
export function parsePrimeAbgbProductPrice(html) {
  if (!text(html)) {
    console.warn('[PrimeABGB Parser] Empty HTML payload received.');
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

    console.info('[PrimeABGB Parser] Parsed product page.', { price, availability });
    return { price, availability };
  } catch (error) {
    console.error('[PrimeABGB Parser] Failed to parse product page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { price: null, availability: 'Unknown' };
  }
}
