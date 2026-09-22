/**
 * testPriceService.js — Standalone test to verify the price service can
 * fetch live prices for a component from all 4 retailers.
 *
 * Usage:  node src/scripts/testPriceService.js
 *
 * What it does:
 *   1. Connects to MongoDB.
 *   2. Picks a component that has retailer URLs in its prices array.
 *   3. Calls fetchLivePrices() to scrape all 4 retailers.
 *   4. Prints the results as a formatted table.
 *
 * NOTE: This requires Playwright browsers to be installed.
 *       Run `npx playwright install chromium` if you haven't already.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Component from '../models/Component.js';
import { fetchLivePrices } from '../services/priceService.js';

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   PCForge Price Service Test                       ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  // 1. Connect
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('✘ MONGODB_URI not found in .env — aborting.');
    process.exit(1);
  }
  console.log('→ Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log(`  ✓ Connected to ${mongoose.connection.host}\n`);

  // 2. Find a test component (prefer a popular GPU or CPU with 4 retailer URLs)
  const testComponent = await Component.findOne({
    'prices.3': { $exists: true },  // has at least 4 price entries
    category: { $in: ['GPU', 'CPU'] },
  })
    .select('_id name category prices')
    .lean();

  if (!testComponent) {
    console.error('✘ No suitable test component found with 4+ retailer URLs.');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`→ Test Component: "${testComponent.name}" (${testComponent.category})`);
  console.log(`  ID: ${testComponent._id}`);
  console.log(`  Retailer URLs:`);
  for (const p of testComponent.prices) {
    console.log(`    • ${p.storeName || p.store}: ${p.productUrl}`);
  }
  console.log('');

  // 3. Fetch live prices
  console.log('→ Scraping live prices from all retailers...');
  console.log('  (This may take 10-30 seconds — each retailer uses a headless browser)\n');

  const startTime = Date.now();

  try {
    const updatedPrices = await fetchLivePrices(testComponent._id);
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n→ Results (scraped in ${durationSec}s):\n`);
    console.log('  ┌─────────────────┬────────────┬───────────────┐');
    console.log('  │ Retailer        │ Price (₹)  │ Availability  │');
    console.log('  ├─────────────────┼────────────┼───────────────┤');

    for (const entry of updatedPrices) {
      const store = (entry.storeName || entry.store || 'Unknown').padEnd(15);
      const price = entry.price ? `₹${entry.price.toLocaleString('en-IN')}`.padEnd(10) : 'N/A       ';
      const avail = (entry.availability || 'Unknown').padEnd(13);
      console.log(`  │ ${store} │ ${price} │ ${avail} │`);
    }

    console.log('  └─────────────────┴────────────┴───────────────┘');

    // Summary
    const validPrices = updatedPrices.filter((p) => p.price && p.price > 0);
    if (validPrices.length > 0) {
      const cheapest = validPrices.reduce((min, p) => (p.price < min.price ? p : min));
      console.log(`\n  💰 Cheapest: ₹${cheapest.price.toLocaleString('en-IN')} at ${cheapest.storeName || cheapest.store}`);
    } else {
      console.log('\n  ⚠ No valid prices were scraped (retailers may be blocking or URLs may be incorrect).');
    }

    console.log(`\n  ✅ Test passed — ${validPrices.length}/${updatedPrices.length} retailers returned valid prices.`);
  } catch (error) {
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n  ✘ Test failed after ${durationSec}s:`, error.message);
  }

  console.log('');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n✘ Fatal error:', err);
  process.exit(1);
});
