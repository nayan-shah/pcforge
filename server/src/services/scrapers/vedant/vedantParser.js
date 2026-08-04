import { load } from 'cheerio';

const BASE_URL = 'https://www.vedantcomputers.com';
const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const absoluteUrl = (value) => {
  try { return value ? new URL(text(value), BASE_URL).href : ''; } catch { return ''; }
};
const price = (value) => {
  const parsed = Number(text(value).replace(/[^0-9.,]/g, '').replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function parseVedantSearchHtml(html) {
  if (!text(html)) return [];
  try {
    const $ = load(html);
    const products = [];
    $('.product-layout, .product-thumb, .product-grid').each((_, node) => {
      const card = $(node);
      const link = card.find('.caption h4 a, .product-name a, h4 a').first();
      const name = text(link.text()) || text(link.attr('title'));
      const url = absoluteUrl(link.attr('href'));
      const image = card.find('img').first();
      if (!name || !url) return;
      products.push({
        name,
        price: price(card.find('.price-new, .price').first().text()),
        currency: 'INR',
        url,
        image: absoluteUrl(image.attr('src') || image.attr('data-src') || image.attr('data-original')),
        itemStatus: text(card.find('.stock, .availability').first().text()) || 'Unknown',
      });
    });
    return products;
  } catch (error) {
    console.error('[Vedant Parser] Failed to parse search HTML.', { message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}
