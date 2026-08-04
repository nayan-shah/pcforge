import { load } from 'cheerio';

const BASE_URL = 'https://www.mdcomputers.in';

const cleanText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const toAbsoluteUrl = (value) => {
  const url = cleanText(value);
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;

  try {
    return new URL(url, BASE_URL).href;
  } catch {
    return '';
  }
};

export const parseMdComputersPrice = (rawPrice) => {
  const value = cleanText(rawPrice).replace(/[^0-9.,]/g, '');
  if (!value) return null;

  const price = Number(value.replace(/,/g, ''));
  return Number.isFinite(price) && price > 0 ? price : null;
};

const getImageUrl = ($, card) => {
  const image = card.find('img.product-image-photo, .product-image-container img, img').first();
  return toAbsoluteUrl(
    image.attr('src')
    || image.attr('data-src')
    || image.attr('data-original')
    || image.attr('data-lazy-src'),
  );
};

const getAvailability = (card) => cleanText(
  card.find('.stock.available, .availability .available, .stock, .availability').first().text(),
) || 'Unknown';

/**
 * Converts an MDComputers search page into retailer-shaped data. It never
 * normalizes Offer fields; that responsibility belongs to the adapter.
 */
export function parseMdComputersSearchHtml(html) {
  if (!cleanText(html)) {
    console.warn('[MDComputers Parser] Empty HTML payload received.');
    return [];
  }

  try {
    const $ = load(html);
    const products = [];

    $('.products-grid .product-item, .search.results .product-item, .product-item-info').each((_, node) => {
      const card = $(node);
      const link = card.find('a.product-item-link, a.product-item-photo').first();
      const name = cleanText(card.find('a.product-item-link').first().text()) || cleanText(link.attr('title'));
      const productUrl = toAbsoluteUrl(link.attr('href'));
      const priceText = cleanText(card.find('.price-box .special-price .price, .price-box .price-wrapper .price, .price-box .price').first().text());

      if (!name || !productUrl) {
        console.warn('[MDComputers Parser] Skipping malformed product card.', { hasName: Boolean(name), hasProductUrl: Boolean(productUrl) });
        return;
      }

      products.push({
        name,
        currentPrice: parseMdComputersPrice(priceText),
        productUrl,
        imageUrl: getImageUrl($, card),
        stockStatus: getAvailability(card),
        currency: 'INR',
      });
    });

    return products;
  } catch (error) {
    console.error('[MDComputers Parser] Failed to parse search HTML.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
