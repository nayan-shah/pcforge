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
 * Extracts stock status from a Vedant Computers product detail page.
 */
const getAvailability = ($) => {
  const stockEl = $('.stock, .availability, .stock-status, [class*="stock"]').first();
  const availability = normalizeAvailability(
    `${stockEl.attr('class') ?? ''} ${text(stockEl.text())}`,
  );
  if (availability !== 'Unknown') return availability;

  const hasAddToCart =
    $('#button-cart, [id*="button-cart"], .btn-cart, input[value*="Add to Cart"]').length > 0;
  return hasAddToCart ? normalizeAvailability('Add to Cart') : 'Unknown';
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
    const markup = parseRetailerProductMarkup(html);

    // Prefer sale/discounted price, fall back to any price element.
    const salePriceText = text($('.price-new, #product-price .price-new').first().text());
    const regularPriceText = text($('.price-old').first().text());
    const anyPriceText = text($('.product-price, #product-price, .price').first().text());

    const price =
      parsePrice(salePriceText) || parsePrice(regularPriceText) || parsePrice(anyPriceText);

    const availability =
      markup.availability !== 'Unknown' ? markup.availability : getAvailability($);

    console.info('[Vedant Parser] Parsed product page.', { price, availability });
    return { price: price ?? markup.price, availability, productName: markup.productName };
  } catch (error) {
    console.error('[Vedant Parser] Failed to parse product page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { price: null, availability: 'Unknown' };
  }
}

/**
 * Parses a Vedant Computers search results page and returns an array of product objects.
 * Used by the search orchestrator flow.
 *
 * @param {string} html — Full HTML of the search results page.
 * @returns {Array<{ name: string, price: number, currency: string, url: string, image: string, itemStatus: string }>}
 */
export function parseVedantSearchHtml(html) {
  if (!text(html)) return [];

  try {
    const $ = load(html);
    const products = [];

    // Vedant uses OpenCart Journal3 theme — product cards in search results.
    $(
      '.product-layout, .product-thumb, .product-grid .product-item, .main-products .product-item-container',
    ).each((_, el) => {
      const $el = $(el);
      const name = text($el.find('.name a, .product-name a, h4 a, .caption h4 a').first().text());
      const priceText = text(
        $el.find('.price-new').first().text() || $el.find('.product-price, .price').first().text(),
      );
      const url =
        $el.find('.name a, .product-name a, h4 a, .caption h4 a').first().attr('href') || '';
      const image =
        $el.find('img.img-responsive, img').first().attr('src') ||
        $el.find('img').first().attr('data-src') ||
        '';
      const stockText = text($el.find('.stock, .availability, [class*="stock"]').first().text());
      const actionText = text($el.find('button, a').text());

      const price = parsePrice(priceText);
      if (name && price) {
        products.push({
          name,
          price,
          currency: 'INR',
          url,
          image,
          itemStatus: normalizeAvailability(stockText || actionText),
        });
      }
    });

    console.info('[Vedant Parser] Parsed search results.', { count: products.length });
    return products;
  } catch (error) {
    console.error('[Vedant Parser] Failed to parse search page.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
