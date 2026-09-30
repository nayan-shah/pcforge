/**
 * backfillMultiStorePrices.js
 *
 * Normalizes the prices array for every component in MongoDB.
 * Only cleans up existing price entries (consistent field names, sorting).
 * Does NOT generate estimated/fake prices for stores without real offers.
 *
 * Usage: node src/scripts/backfillMultiStorePrices.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Component from '../models/Component.js';
import { sortPricesLowToHigh } from '../services/priceComparisonService.js';

async function main() {
  console.log('\n==============================================');
  console.log('  PCForge Price Normalization (no fakes)');
  console.log('==============================================\n');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcforge';
  console.log(`-> Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('  OK Connected!\n');

  const cursor = Component.find().cursor();
  let totalProcessed = 0;
  let totalUpdated = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    totalProcessed++;
    try {
      const normalized = sortPricesLowToHigh(doc.prices || []);
      // Only save if the normalized result differs (avoids unnecessary writes).
      if (JSON.stringify(normalized) !== JSON.stringify(doc.prices)) {
        doc.prices = normalized;
        doc.markModified('prices');
        await doc.save();
        totalUpdated++;

        if (totalUpdated % 20 === 0 || totalUpdated <= 5) {
          console.log(`  [+] [${doc.category}] Normalized ${normalized.length} offers for: ${doc.name.substring(0, 45)}...`);
        }
      }
    } catch (err) {
      console.warn(`  [!] Error processing "${doc.name}":`, err.message);
    }
  }

  console.log('\n==============================================');
  console.log(`  Done! Processed: ${totalProcessed} | Updated: ${totalUpdated}`);
  console.log('==============================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

