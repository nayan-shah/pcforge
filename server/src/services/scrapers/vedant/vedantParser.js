import { load } from 'cheerio';

const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const parsePrice = (value) => {
  const parsed = Number(text(value).replace(/[^0-9.,]/g, '').replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Extracts stock status from a Vedant Computers product detail page.
 */
const getAvailability = ($) => {
  const stockEl = $('.stock, .availability, .stock-status, [class*="stock"]').first();
  const stockText = text(stockEl.text());
  if (/out.of.stock|unavailable|sold.out/i.test(stockText)) return 'Out of Stock';
  if (/in.stock|available/i.test(stockText)) return 'In Stock';

  // OpenCart "Add to Cart" button presence implies in stock.
  const hasAddToCart = $('#button-cart, [id*="button-cart"], .btn-cart, input[value*="Add to Cart"]').length > 0;
  return hasAddToCart ? 'In Stock' : 'Unknown';
};

/**
 * Parses a Vedant Computers product detail page to extract ONLY price + availability.
 *
 * Vedant uses OpenCart with the Journal3 theme. Product detail page selectors:
 *   - Sale price: .price-new, #product-price .price-new
 *   - Regular:    .price-old (strikethrough original), or generic .price
 *
 * @param {string} html — Full HTML of the product detail page.
 * @returns {{ price: number | null, availability: string }}
 */
export function parseVedantProductPrice(html) {
  if (!text(html)) {
    console.warn('[Vedant Parser] Empty HTML payload received.');
    return { price: null, availability: 'Unknown' };
  }

  try {
    const $ = load(html);

    // Prefer sale/discounted price, fall back to any price element.
    const salePriceText = text($('.price-new, #product-price .price-new').first().text());
    const regularPriceText = text($('.price-old').first().text());
    const anyPriceText = text($('.product-price, #product-price, .price').first().text());

    const price =
      parsePrice(salePriceText) ||
      parsePrice(regularPriceText) ||
      parsePrice(anyPriceText);

    const availability = getAvailability($);

    console.info('[Vedant Parser] Parsed product page.', { price, availability });
    return { price, availability };
  } catch (error) {
    console.error('[Vedant Parser] Failed to parse product page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { price: null, availability: 'Unknown' };
  }
}
