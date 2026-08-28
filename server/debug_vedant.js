import { fetchVedantSearchHtml } from './src/services/scrapers/vedant/vedantSearchClient.js';
import { writeFileSync } from 'fs';

const html = await fetchVedantSearchHtml('ryzen 5 5600x');
if (html) {
  writeFileSync('vedant_debug.html', html, 'utf8');
  console.log(`Saved ${html.length} bytes to vedant_debug.html`);

  // Search for common product card patterns
  const patterns = [
    'product-layout', 'product-thumb', 'product-grid',
    'product-list', 'product-card', 'product-item',
    'product_', 'main-products', 'content-products',
    'price-new', 'price-old', 'price-normal',
    '5600', 'Ryzen',
  ];
  for (const p of patterns) {
    const count = (html.match(new RegExp(p, 'gi')) || []).length;
    if (count > 0) console.log(`  "${p}" found ${count} times`);
  }
} else {
  console.log('No HTML returned');
}
