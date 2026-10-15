import { load } from 'cheerio';

const cleanText = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

export class RetailerFetchError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'RetailerFetchError';
    this.statusCode = statusCode;
  }
}

export const normalizeRetailerPrice = (value) => {
  const normalized = cleanText(value)
    .replace(/[₹,\s]/g, '')
    .replace(/[^\d.]/g, '');
  const price = Number(normalized);
  return Number.isFinite(price) && price > 0 ? price : null;
};

const flattenJsonLd = (value) => {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== 'object') return [];
  return [value, ...flattenJsonLd(value['@graph']), ...flattenJsonLd(value.itemListElement)];
};

const productType = (value) => {
  const types = Array.isArray(value?.['@type']) ? value['@type'] : [value?.['@type']];
  return types.some((type) => String(type ?? '').toLowerCase() === 'product');
};

const findProductData = ($) => {
  const nodes = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      nodes.push(...flattenJsonLd(JSON.parse($(element).text())));
    } catch {
      // Ignore malformed structured-data blocks and continue with page markup.
    }
  });

  return nodes.find(productType) ?? null;
};

const priceFromOffers = (offers) => {
  const candidates = Array.isArray(offers) ? offers : [offers];
  for (const offer of candidates) {
    const price = normalizeRetailerPrice(offer?.price ?? offer?.lowPrice);
    if (price) return price;
  }
  return null;
};

export const normalizeAvailability = (value) => {
  const normalized = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  if (/outofstock|soldout|unavailable|notavailable/.test(normalized)) return 'Out of Stock';
  if (/instock|available/.test(normalized)) return 'In Stock';
  if (/addtocart|buynow/.test(normalized)) return 'In Stock';
  if (/preorder|presale/.test(normalized)) return 'Preorder';
  return 'Unknown';
};

export const parseRetailerProductMarkup = (html) => {
  if (!cleanText(html)) {
    return { price: null, availability: 'Unknown', productName: '' };
  }

  const $ = load(html);
  const product = findProductData($);
  const metaPrice =
    $('meta[property="product:price:amount"], meta[itemprop="price"], meta[name="price"]')
      .first()
      .attr('content') ?? $('[itemprop="price"]').first().attr('content');
  const selectorPrice =
    $('[itemprop="price"], .woocommerce-Price-amount, .price-new, .product-price, p.price .amount')
      .first()
      .attr('content') ??
    $('[itemprop="price"], .woocommerce-Price-amount, .price-new, .product-price, p.price .amount')
      .first()
      .text();

  const stockMarkup = $(
    '[itemprop="availability"], .stock, .availability, .stock-status, [class*="stock-status"]',
  ).first();
  const offerList = Array.isArray(product?.offers) ? product.offers : [product?.offers];
  const stockValue =
    offerList.find((offer) => offer?.availability)?.availability ??
    $('meta[property="product:availability"], meta[itemprop="availability"]')
      .first()
      .attr('content') ??
    stockMarkup.attr('content') ??
    stockMarkup.attr('class') ??
    stockMarkup.text();
  let availability = normalizeAvailability(stockValue);

  if (availability === 'Unknown') {
    const actionText = $('button, a, input[type="submit"]')
      .map((_, element) => $(element).attr('value') ?? $(element).text())
      .get()
      .join(' ');
    availability = normalizeAvailability(actionText);
  }

  return {
    price:
      priceFromOffers(product?.offers) ??
      normalizeRetailerPrice(metaPrice) ??
      normalizeRetailerPrice(selectorPrice),
    availability,
    productName:
      cleanText(product?.name) ||
      cleanText(
        $('h1.product_title, h1.product-title, .product_title, [itemprop="name"], h1')
          .first()
          .text(),
      ) ||
      cleanText($('meta[property="og:title"]').first().attr('content')),
  };
};
