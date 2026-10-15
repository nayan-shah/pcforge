import { load } from 'cheerio';
import {
  normalizeAvailability,
  normalizeRetailerPrice,
  parseRetailerProductMarkup,
} from '../retailerMarkup.js';

const cleanText = (v) =>
  String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Parses a price string from MDComputers, stripping currency symbols and commas.
 * Returns a positive number or null.
 */
export const parseMdComputersPrice = (raw) => {
  return normalizeRetailerPrice(raw);
};

/**
 * Extracts availability status from an MDComputers product detail page.
 */
const getAvailability = ($) => {
  const stockEl = $('.stock, .availability, [class*="stock-status"]').first();
  const availability = normalizeAvailability(
    `${stockEl.attr('class') ?? ''} ${cleanText(stockEl.text())}`,
  );
  if (availability !== 'Unknown') return availability;

  const hasAddToCart =
    $('button.single_add_to_cart_button, .add-to-cart-button, [name="add-to-cart"]').length > 0;
  return hasAddToCart ? normalizeAvailability('Add to Cart') : 'Unknown';
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
    const markup = parseRetailerProductMarkup(html);

    // Price: prefer sale/discounted price, fall back to any visible price.
    const salePriceText = cleanText(
      $('p.price ins .amount, .price ins .woocommerce-Price-amount, span.ins .amount')
        .first()
        .text(),
    );
    const regularPriceText = cleanText(
      $('p.price > .amount, .price > .woocommerce-Price-amount, .price .amount').first().text(),
    );
    const anyPriceText = cleanText($('.amount, .woocommerce-Price-amount').first().text());

    const price =
      parseMdComputersPrice(salePriceText) ||
      parseMdComputersPrice(regularPriceText) ||
      parseMdComputersPrice(anyPriceText);

    const availability =
      markup.availability !== 'Unknown' ? markup.availability : getAvailability($);

    console.info('[MDComputers Parser] Parsed product page.', { price, availability });
    return { price: price ?? markup.price, availability, productName: markup.productName };
  } catch (error) {
    console.error('[MDComputers Parser] Failed to parse product page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { price: null, availability: 'Unknown' };
  }
}

/**
 * Parses an MDComputers search results page and returns an array of product objects.
 * Used by the search orchestrator flow (not by the price-only flow).
 *
 * @param {string} html — Full HTML of the search results page.
 * @returns {Array<{ name: string, currentPrice: number, currency: string, productUrl: string, imageUrl: string, stockStatus: string }>}
 */
export function parseMdComputersSearchHtml(html) {
  if (!cleanText(html)) return [];

  try {
    const $ = load(html);
    const products = [];

    // MDComputers uses a Magento/custom grid layout for search results.
    $('li.product-item, .product-grid-item, .product-item-info').each((_, el) => {
      const $el = $(el);
      const name = cleanText(
        $el.find('.product-item-link, .product-entities-title a, .product-name a').first().text(),
      );
      const priceText = cleanText(
        $el
          .find(
            '.special-price .price, .price-final_price .price, .price-wrapper .price, .amount, .price',
          )
          .first()
          .text(),
      );
      const productUrl =
        $el
          .find('.product-item-link, .product-entities-title a, .product-name a')
          .first()
          .attr('href') || '';
      const imageUrl = $el.find('img.product-image-photo, img').first().attr('src') || '';
      const stockText = cleanText(
        $el.find('.stock, .availability, [class*="stock"]').first().text(),
      );
      const actionText = cleanText($el.find('button, a').text());

      const price = parseMdComputersPrice(priceText);
      if (name && price) {
        products.push({
          name,
          currentPrice: price,
          currency: 'INR',
          productUrl,
          imageUrl,
          stockStatus: normalizeAvailability(stockText || actionText),
        });
      }
    });

    console.info('[MDComputers Parser] Parsed search results.', { count: products.length });
    return products;
  } catch (error) {
    console.error('[MDComputers Parser] Failed to parse search page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
