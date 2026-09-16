/**
 * backfillSpecifications.js
 *
 * Scans all Component documents in MongoDB and enriches them with:
 *   1. Extracted hardware specifications
 *   2. Structured compatibility rules (socket, formFactor, power, etc.)
 *   3. Informative technical descriptions (if empty)
 *
 * Usage: node src/scripts/backfillSpecifications.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Component from '../models/Component.js';
import { resolveSpecifications } from '../utils/specs.js';

async function main() {
  console.log('\n==============================================');
  console.log('  PCForge Component Specification Backfill');
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
      const resolved = resolveSpecifications(doc);
      let needsSave = false;

      // Check if specifications need updating
      const currentSpecsCount = Object.keys(doc.specifications || {}).length;
      const newSpecsCount = Object.keys(resolved.flatSpecs || {}).length;

      if (newSpecsCount > currentSpecsCount || currentSpecsCount === 0) {
        doc.specifications = {
          ...(doc.specifications || {}),
          ...resolved.flatSpecs,
        };
        doc.markModified('specifications');
        needsSave = true;
      }

      // Check if description needs filling
      if (!doc.description || doc.description.trim() === '') {
        doc.description = resolved.inferredDescription;
        needsSave = true;
      }

      // Check if compatibility needs updating
      if (!doc.compatibility || Object.keys(doc.compatibility).length === 0) {
        doc.compatibility = resolved.compatibility;
        doc.markModified('compatibility');
        needsSave = true;
      }

      if (needsSave) {
        await doc.save();
        totalUpdated++;
        if (totalUpdated % 10 === 0 || totalUpdated <= 5) {
          console.log(`  [+] [${doc.category}] Enriched specs for: ${doc.name.substring(0, 50)}...`);
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
  console.error('Fatal backfill error:', err);
  process.exit(1);
});
