import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeAvailability,
  normalizeRetailerPrice,
  parseRetailerProductMarkup,
} from './scrapers/retailerMarkup.js';
import {
  getProductSearchQueries,
  isDirectProductUrl,
  isExactProductTitle,
} from './scrapers/exactProductMatch.js';
import { getLowestPrice, normalizeOffer, sortPricesLowToHigh } from './priceComparisonService.js';
import { parseVedantSearchHtml } from './scrapers/vedant/vedantParser.js';

test('normalizes INR prices without accepting zero or malformed values', () => {
  assert.equal(normalizeRetailerPrice(' ₹ 1,23,456.00 '), 123456);
  assert.equal(normalizeRetailerPrice('₹0'), null);
  assert.equal(normalizeRetailerPrice('Price unavailable'), null);
});

test('reads structured product data and keeps unknown availability unknown', () => {
  const html = `
    <script type="application/ld+json">
      {"@type":"Product","name":"AMD Ryzen 5 5600X","offers":{"price":"₹15,350","availability":"https://schema.org/OutOfStock"}}
    </script>
    <h1>AMD Ryzen 5 5600X</h1>`;

  assert.deepEqual(parseRetailerProductMarkup(html), {
    price: 15350,
    availability: 'Out of Stock',
    productName: 'AMD Ryzen 5 5600X',
  });
  assert.equal(normalizeAvailability(''), 'Unknown');
  assert.equal(normalizeAvailability('Not Available'), 'Out of Stock');
});

test('parses the current Vedant sale price instead of concatenating sale and list prices', () => {
  const html = `
    <div class="product-layout">
      <div class="name"><a href="/amd-ryzen-5-5600x">AMD Ryzen 5 5600X Processor</a></div>
      <div class="price">from Save -66% <span class="price-new">₹14,250.00</span> <span class="price-old">₹42,000.00</span></div>
    </div>`;
  const [offer] = parseVedantSearchHtml(html);
  assert.equal(offer.name, 'AMD Ryzen 5 5600X Processor');
  assert.equal(offer.price, 14250);
  assert.equal(offer.url, '/amd-ryzen-5-5600x');
});

test('requires the complete identifying model tokens and rejects model variants', () => {
  const componentName = 'ASUS Dual GeForce RTX 4060 8GB OC';
  assert.equal(
    isExactProductTitle(componentName, 'ASUS', 'ASUS Dual GeForce RTX 4060 8GB OC'),
    true,
  );
  assert.equal(
    isExactProductTitle(
      'AMD Ryzen 5 5600X 6-Core Processor',
      'AMD',
      'AMD Ryzen 5 5600X Processor (6 Cores, 12 Threads)',
    ),
    true,
  );
  assert.equal(
    isExactProductTitle(componentName, 'ASUS', 'ASUS Dual GeForce RTX 4060 Ti 8GB OC'),
    false,
  );
  assert.equal(
    isExactProductTitle('AMD Ryzen 5 5600X 6-Core Processor', 'AMD', 'AMD Ryzen 5 5600'),
    false,
  );
});

test('accepts direct retailer product URLs but rejects search/category URLs', () => {
  assert.equal(
    isDirectProductUrl('PCStudio', 'https://www.pcstudio.in/product/amd-ryzen-5-5600x/'),
    true,
  );
  assert.equal(
    isDirectProductUrl('PCStudio', 'https://www.pcstudio.in/?s=ryzen&post_type=product'),
    false,
  );
  assert.equal(isDirectProductUrl('Vedant', 'https://www.vedantcomputers.com/category/cpu'), false);
  assert.equal(
    isDirectProductUrl(
      'Vedant',
      'https://www.vedantcomputers.com/amd-ryzen-5-5600x-processor?search=5600X',
    ),
    true,
  );
  assert.deepEqual(getProductSearchQueries('AMD Ryzen 5 5600X 6-Core Processor'), [
    'AMD Ryzen 5 5600X',
    'AMD Ryzen 5 5600X 6-Core Processor',
  ]);
});

test('normalizes missing and zero prices without marking them in stock or cheapest', () => {
  const offers = sortPricesLowToHigh([
    { storeName: 'Missing', productUrl: 'https://example.test/missing', price: 0 },
    {
      storeName: 'Out of stock',
      productUrl: 'https://example.test/out',
      price: 1000,
      inStock: false,
    },
    {
      storeName: 'Valid',
      productUrl: 'https://example.test/valid',
      price: 1200,
      inStock: true,
    },
  ]);

  assert.equal(normalizeOffer({ price: null }).price, null);
  assert.equal(normalizeOffer({ price: 0, currentPrice: 1200 }).price, 1200);
  assert.equal(normalizeOffer({}).inStock, null);
  assert.equal(normalizeOffer({}).availability, 'Unknown');
  assert.equal(normalizeOffer({}).lastUpdated, null);
  assert.equal(offers[0].storeName, 'Out of stock');
  assert.equal(offers[2].price, null);
  assert.equal(getLowestPrice(offers), 1200);
});
