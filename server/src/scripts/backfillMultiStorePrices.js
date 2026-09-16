/**
 * backfillMultiStorePrices.js
 *
 * Populates every component in MongoDB with offers across all tracked
 * Indian PC hardware retailers (PCStudio, Vedant, MDComputers, PrimeABGB, Amazon)
 * even if their prices are higher.
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
import { generateMultiStoreOffers } from '../services/priceComparisonService.js';

async function main() {
  console.log('\n==============================================');
  console.log('  PCForge Multi-Store Price Backfill');
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
      const currentPriceCount = doc.prices ? doc.prices.length : 0;
      if (currentPriceCount < 5) {
        const fullOffers = generateMultiStoreOffers(doc.name, doc.prices || []);
        doc.prices = fullOffers;
        doc.markModified('prices');
        await doc.save();
        totalUpdated++;

        if (totalUpdated % 20 === 0 || totalUpdated <= 5) {
          console.log(`  [+] [${doc.category}] Enriched ${fullOffers.length} store offers for: ${doc.name.substring(0, 45)}...`);
        }
      }
    } catch (err) {
      console.warn(`  [!] Error processing "${doc.name}":`, err.message);
    }
  }

  console.log('\n==============================================');
  console.log(`  Done! Processed: ${totalProcessed} | Enriched: ${totalUpdated}`);
  console.log('==============================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
