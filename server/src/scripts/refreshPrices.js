import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { refreshAllPrices } from '../services/priceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const parseLimit = (args) => {
  const limitArgument = args.find((argument) => argument.startsWith('--limit='));
  if (!limitArgument) return 0;
  const limit = Number(limitArgument.slice('--limit='.length));
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Use --limit=<positive integer> when limiting a refresh run.');
  }
  return limit;
};

async function main() {
  const limit = parseLimit(process.argv.slice(2));
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcforge';

  await mongoose.connect(mongoUri);
  try {
    const report = await refreshAllPrices({ limit });
    console.log('\nRetailer price refresh summary');
    console.log(`Components processed: ${report.componentsProcessed}`);
    for (const [store, counts] of Object.entries(report.perRetailer)) {
      console.log(`${store}: ${counts.fetched} fetched, ${counts.failed} failed`);
    }

    console.log('\nComponents still showing Price N/A');
    if (report.unavailable.length === 0) {
      console.log('None');
    } else {
      for (const entry of report.unavailable) {
        console.log(`- ${entry.component} | ${entry.retailer} | ${entry.reason}`);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Price refresh failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
