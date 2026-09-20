import { load } from 'cheerio';

const cleanText = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

/**
 * Parses a price string from MDComputers, stripping currency symbols and commas.
 * Returns a positive number or null.
 */
export const parseMdComputersPrice = (raw) => {
  const value = cleanText(raw).replace(/[^0-9.,]/g, '');
  if (!value) return null;
  const price = Number(value.replace(/,/g, ''));
  return Number.isFinite(price) && price > 0 ? price : null;
};

/**
 * Extracts availability status from an MDComputers product detail page.
 */
const getAvailability = ($) => {
  // Check common WooCommerce / MDComputers stock indicators on product pages.
  const stockEl = $('.stock, .availability, [class*="stock-status"]').first();
  const stockText = cleanText(stockEl.text());
  if (/out.of.stock|unavailable|sold.out/i.test(stockText)) return 'Out of Stock';
  if (/in.stock|available/i.test(stockText)) return 'In Stock';

  // Check for "Add to cart" button — presence implies in stock.
  const hasAddToCart = $('button.single_add_to_cart_button, .add-to-cart-button, [name="add-to-cart"]').length > 0;
  return hasAddToCart ? 'In Stock' : 'Unknown';
};

/**
 * Parses an MDComputers product detail page to extract ONLY price + availability.
 *
 * Targets a direct product page URL (not a search results page).
 * Price selectors based on MDComputers' WooCommerce / custom theme:
 *   - Sale price:    span.ins .amount, ins .woocommerce-Price-amount
 *   - Regular price: .price .amount, .woocommerce-Price-amount
 *
 * @param {string} html — Full HTML of the product detail page.
 * @returns {{ price: number | null, availability: string }}
 */
export function parseMdComputersProductPrice(html) {
  if (!cleanText(html)) {
    console.warn('[MDComputers Parser] Empty HTML payload received.');
    return { price: null, availability: 'Unknown' };
  }

  try {
    const $ = load(html);

    // Price: prefer sale/discounted price, fall back to any visible price.
    const salePriceText = cleanText($('p.price ins .amount, .price ins .woocommerce-Price-amount, span.ins .amount').first().text());
    const regularPriceText = cleanText($('p.price > .amount, .price > .woocommerce-Price-amount, .price .amount').first().text());
    const anyPriceText = cleanText($('.amount, .woocommerce-Price-amount').first().text());

    const price =
      parseMdComputersPrice(salePriceText) ||
      parseMdComputersPrice(regularPriceText) ||
      parseMdComputersPrice(anyPriceText);

    const availability = getAvailability($);

    console.info('[MDComputers Parser] Parsed product page.', { price, availability });
    return { price, availability };
  } catch (error) {
    console.error('[MDComputers Parser] Failed to parse product page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { price: null, availability: 'Unknown' };
  }
}
