import { load } from 'cheerio';
import {
  normalizeAvailability,
  normalizeRetailerPrice,
  parseRetailerProductMarkup,
} from '../retailerMarkup.js';

const text = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

const parsePrice = (value) => {
  return normalizeRetailerPrice(value);
};

/**
 * Extracts stock status from a PrimeABGB WooCommerce product detail page.
 */
const getAvailability = ($) => {
  const stockEl = $('.stock, .availability, [class*="stock-status"]').first();
  const availability = normalizeAvailability(
    `${stockEl.attr('class') ?? ''} ${text(stockEl.text())}`,
  );
  if (availability !== 'Unknown') return availability;

  const hasAddToCart = $('button.single_add_to_cart_button, .add_to_cart_button').length > 0;
  return hasAddToCart ? normalizeAvailability('Add to Cart') : 'Unknown';
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
    const markup = parseRetailerProductMarkup(html);

    // Prefer discounted sale price, fall back to regular.
    const salePriceText = text(
      $('p.price ins .woocommerce-Price-amount, .summary ins .woocommerce-Price-amount')
        .first()
        .text(),
    );
    const regularPriceText = text(
      $('p.price > .woocommerce-Price-amount, .summary > .price .woocommerce-Price-amount')
        .first()
        .text(),
    );
    const anyPriceText = text($('.woocommerce-Price-amount').first().text());

    const price =
      parsePrice(salePriceText) || parsePrice(regularPriceText) || parsePrice(anyPriceText);

    const availability =
      markup.availability !== 'Unknown' ? markup.availability : getAvailability($);

    console.info('[PrimeABGB Parser] Parsed product page.', { price, availability });
    return { price: price ?? markup.price, availability, productName: markup.productName };
  } catch (error) {
    console.error('[PrimeABGB Parser] Failed to parse product page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { price: null, availability: 'Unknown' };
  }
}

/**
 * Parses a PrimeABGB search results page and returns an array of product objects.
 * Used by the search orchestrator flow.
 *
 * @param {string} html — Full HTML of the search results page.
 * @returns {Array<{ product_name: string, sale_price: number, currency_code: string, link: string, image_url: string, stock: string }>}
 */
export function parsePrimeAbgbSearchHtml(html) {
  if (!text(html)) return [];

  try {
    const $ = load(html);
    const products = [];

    // PrimeABGB uses WooCommerce — product cards in search/archive pages.
    $('li.product, .product-grid-item, .products .product').each((_, el) => {
      const $el = $(el);
      const name = text(
        $el.find('.woocommerce-loop-product__title, h2, .product-title a').first().text(),
      );
      const priceText = text(
        $el
          .find('.price ins .woocommerce-Price-amount, .price .woocommerce-Price-amount')
          .first()
          .text(),
      );
      const link = $el.find('a.woocommerce-LoopProduct-link, a').first().attr('href') || '';
      const imageUrl = $el.find('img').first().attr('src') || '';
      const stockText = text($el.find('.stock, .availability, [class*="stock"]').first().text());
      const actionText = text($el.find('button, a').text());

      const price = parsePrice(priceText);
      if (name && price) {
        products.push({
          product_name: name,
          sale_price: price,
          currency_code: 'INR',
          link,
          image_url: imageUrl,
          stock: normalizeAvailability(stockText || actionText),
        });
      }
    });

    console.info('[PrimeABGB Parser] Parsed search results.', { count: products.length });
    return products;
  } catch (error) {
    console.error('[PrimeABGB Parser] Failed to parse search page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
