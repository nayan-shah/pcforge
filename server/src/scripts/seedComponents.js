/**
 * seedComponents.js — Populate the components collection with scraped data.
 *
 * Usage:  node src/scripts/seedComponents.js
 *
 * This script:
 *   1. Connects to MongoDB (same URI as the dev server).
 *   2. Finds or creates a "seed" admin user (for the required `createdBy` field).
 *   3. Scrapes Vedant, PrimeABGB, and PCStudio for a curated set of queries.
 *   4. De-duplicates offers and converts them into Component documents.
 *   5. Upserts into the `components` collection (skip if name already exists).
 *
 * It intentionally skips the MDComputers scraper (Playwright / headless Chrome)
 * to keep the seeding process lightweight and fast.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// Resolve paths relative to the project root so dotenv picks up server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Component from '../models/Component.js';
import User from '../models/User.js';
import { scrapeVedantOffers } from '../services/scrapers/vedant/vedantService.js';
import { scrapePrimeAbgbOffers } from '../services/scrapers/primeabgb/primeAbgbService.js';
import { scrapePcStudioOffers } from '../services/scrapers/pcstudio/pcStudioService.js';

// ── Configuration ────────────────────────────────────────────────────

const SEED_QUERIES = [
  { query: 'AMD Ryzen 7',            category: 'CPU' },
  { query: 'Intel Core i5',          category: 'CPU' },
  { query: 'RTX 4060',               category: 'GPU' },
  { query: 'RX 7600',                category: 'GPU' },
  { query: 'DDR5 16GB',              category: 'RAM' },
  { query: 'DDR4 16GB',              category: 'RAM' },
  { query: 'B650 motherboard',       category: 'Motherboard' },
  { query: 'B760 motherboard',       category: 'Motherboard' },
  { query: '1TB NVMe SSD',           category: 'SSD' },
  { query: '500GB SSD',              category: 'SSD' },
  { query: '650W power supply',      category: 'PSU' },
  { query: '750W PSU',               category: 'PSU' },
  { query: 'tower CPU cooler',       category: 'Cooler' },
  { query: 'AIO liquid cooler',      category: 'Cooler' },
  { query: 'ATX mid tower cabinet',  category: 'Cabinet' },
  { query: 'gaming PC case',         category: 'Cabinet' },
];

const RETAILERS = [
  { name: 'Vedant',    scrape: scrapeVedantOffers },
  { name: 'PrimeABGB', scrape: scrapePrimeAbgbOffers },
  { name: 'PCStudio',  scrape: scrapePcStudioOffers },
];

const KNOWN_BRANDS = [
  'amd', 'asus', 'cooler master', 'corsair', 'crucial', 'deepcool',
  'gigabyte', 'gskill', 'g.skill', 'intel', 'kingston', 'lian li',
  'msi', 'noctua', 'nvidia', 'nzxt', 'sapphire', 'samsung', 'seasonic',
  'thermaltake', 'western digital', 'wd', 'xpg', 'zotac', 'antec',
  'be quiet', 'fractal design', 'galax', 'hyte', 'inno3d', 'teamgroup',
  'team', 'patriot', 'pny', 'silverstone', 'phanteks', 'powercolor',
  'asrock', 'evga', 'hp', 'seagate', 'toshiba', 'arctic',
];

const STOP_WORDS = new Set([
  'and', 'edition', 'for', 'gb', 'graphics', 'in', 'of', 'the', 'with',
  'card', 'processor', 'desktop', 'new', 'gen', 'series',
]);

// ── Helpers ──────────────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const tokenize = (name) =>
  String(name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')
    .split(' ').filter((t) => t && !STOP_WORDS.has(t));

const similarity = (a, b) => {
  const sa = new Set(tokenize(a));
  const sb = new Set(tokenize(b));
  const intersection = [...sa].filter((t) => sb.has(t)).length;
  return intersection / Math.max(1, new Set([...sa, ...sb]).size);
};

const extractBrand = (productName) => {
  const lower = String(productName).toLowerCase();
  return KNOWN_BRANDS.find((b) => lower.includes(b)) || 'Generic';
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const formatBrand = (raw) => {
  const specials = {
    'amd': 'AMD', 'asus': 'ASUS', 'msi': 'MSI', 'intel': 'Intel',
    'nvidia': 'NVIDIA', 'nzxt': 'NZXT', 'wd': 'WD', 'xpg': 'XPG',
    'pny': 'PNY', 'hp': 'HP', 'gskill': 'G.Skill', 'g.skill': 'G.Skill',
    'evga': 'EVGA', 'hyte': 'HYTE',
  };
  return specials[raw.toLowerCase()] || raw.split(' ').map(capitalize).join(' ');
};

// ── Core logic ───────────────────────────────────────────────────────

/**
 * Find or create an admin user to own the seeded components.
 */
async function getOrCreateSeedUser() {
  const email = 'seed-admin@pcforge.local';
  let user = await User.findOne({ email });
  if (user) {
    console.log(`  ✓ Using existing seed user: ${user._id}`);
    return user._id;
  }

  const hashedPassword = await bcrypt.hash('SeedAdmin!2026', 12);
  user = await User.create({
    name: 'PCForge Seed Admin',
    email,
    password: hashedPassword,
    role: 'admin',
  });
  console.log(`  ✓ Created seed admin user: ${user._id}`);
  return user._id;
}

/**
 * Scrape all retailers for a single query and return normalized offers.
 */
async function scrapeAllRetailers(query) {
  const results = await Promise.allSettled(
    RETAILERS.map(async (r) => {
      const offers = await r.scrape(query);
      return { retailer: r.name, offers };
    }),
  );

  const allOffers = [];
  for (const [idx, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      allOffers.push(...result.value.offers);
    } else {
      console.warn(`  ⚠ ${RETAILERS[idx].name} failed for "${query}":`, result.reason?.message ?? result.reason);
    }
  }
  return allOffers;
}

/**
 * Group offers by product — merge prices from different stores into a single
 * component entry when product names are similar enough.
 */
function groupOffersByProduct(offers, category) {
  const groups = []; // { name, brand, category, image, prices: [] }

  for (const offer of offers) {
    if (!offer.productName || !offer.price) continue;

    // Try to match to an existing group
    const match = groups.find((g) => similarity(g.name, offer.productName) >= 0.65);

    const priceEntry = {
      store: offer.storeName,
      storeName: offer.storeName,
      productUrl: offer.productUrl,
      price: Number(offer.price),
      currentPrice: Number(offer.price),
      currency: offer.currency || 'INR',
      inStock: !/out.of.stock|unavailable|sold.out/i.test(offer.availability || ''),
      availability: offer.availability || 'In Stock',
      lastUpdated: new Date(),
    };

    if (match) {
      // Avoid duplicate store entries
      if (!match.prices.some((p) => p.storeName === offer.storeName)) {
        match.prices.push(priceEntry);
      }
      // Prefer the image that exists
      if (!match.image && offer.image) match.image = offer.image;
    } else {
      groups.push({
        name: offer.productName,
        brand: formatBrand(extractBrand(offer.productName)),
        category,
        image: offer.image || '',
        prices: [priceEntry],
      });
    }
  }

  return groups;
}

/**
 * Upsert grouped components into MongoDB.
 */
async function upsertComponents(groups, createdBy) {
  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  for (const group of groups) {
    try {
      // Check if a component with a very similar name already exists
      const existing = await Component.findOne({
        name: { $regex: `^${group.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      });

      if (existing) {
        // Merge in any new price entries from stores we haven't seen before
        const existingStores = new Set(existing.prices.map((p) => p.storeName));
        const newPrices = group.prices.filter((p) => !existingStores.has(p.storeName));
        if (newPrices.length > 0) {
          existing.prices.push(...newPrices);
          // Also add image if the existing one is empty
          if ((!existing.images || existing.images.length === 0) && group.image) {
            existing.images = [group.image];
          }
          await existing.save();
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      await Component.create({
        name: group.name,
        brand: group.brand,
        category: group.category,
        description: '',
        images: group.image ? [group.image] : [],
        prices: group.prices,
        stockStatus: group.prices.some((p) => p.inStock) ? 'In Stock' : 'Out of Stock',
        tags: [group.category.toLowerCase(), group.brand.toLowerCase()],
        createdBy,
      });
      inserted++;
    } catch (err) {
      console.warn(`  ⚠ Failed to upsert "${group.name}":`, err.message);
    }
  }

  return { inserted, skipped, updated };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   PCForge Component Seeder                   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // 1. Connect to MongoDB
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('✘ MONGODB_URI not found in .env — aborting.');
    process.exit(1);
  }
  console.log(`→ Connecting to MongoDB...`);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(`  ✓ Connected to ${mongoose.connection.host}\n`);

  // 2. Get seed user
  console.log('→ Resolving seed admin user...');
  const createdBy = await getOrCreateSeedUser();
  console.log('');

  // 3. Scrape + seed per query
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalUpdated = 0;

  for (const { query, category } of SEED_QUERIES) {
    console.log(`→ Scraping: "${query}" [${category}]`);

    try {
      const offers = await scrapeAllRetailers(query);
      console.log(`  ↳ ${offers.length} raw offers from ${RETAILERS.length} retailers`);

      if (offers.length === 0) {
        console.log('  ↳ No results — skipping.\n');
        continue;
      }

      const groups = groupOffersByProduct(offers, category);
      console.log(`  ↳ ${groups.length} unique products after deduplication`);

      const { inserted, skipped, updated } = await upsertComponents(groups, createdBy);
      totalInserted += inserted;
      totalSkipped += skipped;
      totalUpdated += updated;
      console.log(`  ↳ Inserted: ${inserted} | Updated: ${updated} | Skipped: ${skipped}\n`);
    } catch (err) {
      console.error(`  ✘ Error processing "${query}":`, err.message, '\n');
    }

    // Be polite to retailers
    await delay(1500);
  }

  // 4. Summary
  const totalComponents = await Component.countDocuments();
  console.log('╔══════════════════════════════════════════════╗');
  console.log(`║  Seeding complete!                           ║`);
  console.log(`║  New: ${String(totalInserted).padEnd(6)} Updated: ${String(totalUpdated).padEnd(6)} Skipped: ${String(totalSkipped).padEnd(4)}║`);
  console.log(`║  Total components in DB: ${String(totalComponents).padEnd(20)}║`);
  console.log('╚══════════════════════════════════════════════╝\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n✘ Fatal error:', err);
  process.exit(1);
});
