/**
 * seedComponents.js — Populate the components collection with 200 curated
 * PC components across 8 categories, each with product URLs from 4 Indian
 * retailers (MDComputers, Vedant, PrimeABGB, PCStudio).
 *
 * Usage:  node src/scripts/seedComponents.js
 *
 * Categories & Counts:
 *   CPU (40) · GPU (50) · RAM (30) · SSD (30) · PSU (20) · Cooler (15) · Motherboard (10) · Cabinet (5)
 *
 * Total: 200 components
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Component from '../models/Component.js';
import User from '../models/User.js';
import { resolveSpecifications } from '../utils/specs.js';

// ── Helpers ──────────────────────────────────────────────────────────

/** Build a slug from a product name (lowercase, hyphens). */
const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Build retailer URLs for a product name. */
const urls = (name) => {
  const s = slug(name);
  return [
    {
      store: 'MDComputers',
      storeName: 'MDComputers',
      productUrl: `https://www.mdcomputers.in/${s}`,
      currency: 'INR',
      inStock: true,
      availability: 'In Stock',
      lastUpdated: new Date(),
    },
    {
      store: 'Vedant',
      storeName: 'Vedant',
      productUrl: `https://www.vedantcomputers.com/${s}`,
      currency: 'INR',
      inStock: true,
      availability: 'In Stock',
      lastUpdated: new Date(),
    },
    {
      store: 'PrimeABGB',
      storeName: 'PrimeABGB',
      productUrl: `https://www.primeabgb.com/online-price-reviews-specs/${s}/`,
      currency: 'INR',
      inStock: true,
      availability: 'In Stock',
      lastUpdated: new Date(),
    },
    {
      store: 'PCStudio',
      storeName: 'PCStudio',
      productUrl: `https://www.pcstudio.in/product/${s}/`,
      currency: 'INR',
      inStock: true,
      availability: 'In Stock',
      lastUpdated: new Date(),
    },
  ];
};

// ── Component Data ───────────────────────────────────────────────────

const RAW_COMPONENTS = [
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  CPUs (40 total) — 20 AMD + 20 Intel                          ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // --- AMD Ryzen 5000 Series (Zen 3 / AM4) ---
  { name: 'AMD Ryzen 5 5600X 6-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 5 5600 6-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 5700X 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 5800X 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 5800X3D 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 9 5900X 12-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 9 5950X 16-Core Processor', brand: 'AMD', category: 'CPU' },

  // --- AMD Ryzen 7000 Series (Zen 4 / AM5) ---
  { name: 'AMD Ryzen 5 7600X 6-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 5 7600 6-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 7700X 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 7700 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 7800X3D 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 9 7900X 12-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 9 7950X 16-Core Processor', brand: 'AMD', category: 'CPU' },

  // --- AMD Ryzen 9000 Series (Zen 5 / AM5) ---
  { name: 'AMD Ryzen 5 9600X 6-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 9700X 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 7 9800X3D 8-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 9 9900X 12-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 9 9950X 16-Core Processor', brand: 'AMD', category: 'CPU' },
  { name: 'AMD Ryzen 9 9950X3D 16-Core Processor', brand: 'AMD', category: 'CPU' },

  // --- Intel 12th Gen (Alder Lake / LGA1700) ---
  { name: 'Intel Core i5-12400F 6-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i5-12600K 10-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i7-12700K 12-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i9-12900K 16-Core Processor', brand: 'Intel', category: 'CPU' },

  // --- Intel 13th Gen (Raptor Lake / LGA1700) ---
  { name: 'Intel Core i5-13400F 10-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i5-13600K 14-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i5-13600KF 14-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i7-13700K 16-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i7-13700KF 16-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i9-13900K 24-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i9-13900KS 24-Core Processor', brand: 'Intel', category: 'CPU' },

  // --- Intel 14th Gen (Raptor Lake Refresh / LGA1700) ---
  { name: 'Intel Core i5-14400F 10-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i5-14600K 14-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i5-14600KF 14-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i7-14700K 20-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i7-14700KF 20-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i9-14900K 24-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i9-14900KF 24-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i9-14900KS 24-Core Processor', brand: 'Intel', category: 'CPU' },
  { name: 'Intel Core i3-14100F 4-Core Processor', brand: 'Intel', category: 'CPU' },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  GPUs (50 total) — 36 Nvidia + 14 AMD                         ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // --- Nvidia RTX 4000 (Ada Lovelace) ---
  { name: 'NVIDIA GeForce RTX 4090 24GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'ASUS ROG Strix GeForce RTX 4090 24GB OC', brand: 'ASUS', category: 'GPU' },
  { name: 'MSI GeForce RTX 4090 Suprim X 24GB', brand: 'MSI', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4080 Super 16GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'ASUS TUF Gaming GeForce RTX 4080 Super 16GB OC', brand: 'ASUS', category: 'GPU' },
  { name: 'MSI GeForce RTX 4080 16GB Suprim X', brand: 'MSI', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4070 Ti Super 16GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'Gigabyte GeForce RTX 4070 Ti Super 16GB Aero OC', brand: 'Gigabyte', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4070 Ti 12GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'ZOTAC Gaming GeForce RTX 4070 Ti 12GB Trinity OC', brand: 'Zotac', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4070 Super 12GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'MSI GeForce RTX 4070 Super 12GB Gaming X Slim', brand: 'MSI', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4070 12GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'Gigabyte GeForce RTX 4070 12GB Windforce OC', brand: 'Gigabyte', category: 'GPU' },
  { name: 'ASUS Dual GeForce RTX 4070 12GB OC', brand: 'ASUS', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4060 Ti 16GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4060 Ti 8GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'MSI GeForce RTX 4060 Ti 8GB Gaming X', brand: 'MSI', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 4060 8GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'ASUS Dual GeForce RTX 4060 8GB OC', brand: 'ASUS', category: 'GPU' },
  { name: 'Gigabyte GeForce RTX 4060 8GB Eagle OC', brand: 'Gigabyte', category: 'GPU' },
  { name: 'ZOTAC Gaming GeForce RTX 4060 8GB Twin Edge OC', brand: 'Zotac', category: 'GPU' },

  // --- Nvidia RTX 3000 (Ampere) ---
  { name: 'NVIDIA GeForce RTX 3090 Ti 24GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 3090 24GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 3080 Ti 12GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 3080 10GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 3070 Ti 8GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 3070 8GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 3060 Ti 8GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'NVIDIA GeForce RTX 3060 12GB Founders Edition', brand: 'NVIDIA', category: 'GPU' },
  { name: 'ZOTAC Gaming GeForce RTX 3060 12GB Twin Edge OC', brand: 'Zotac', category: 'GPU' },
  { name: 'MSI GeForce RTX 3060 12GB Ventus 2X OC', brand: 'MSI', category: 'GPU' },
  { name: 'Gigabyte GeForce RTX 3060 12GB Gaming OC', brand: 'Gigabyte', category: 'GPU' },
  { name: 'ASUS TUF Gaming GeForce RTX 3060 12GB OC V2', brand: 'ASUS', category: 'GPU' },
  { name: 'Inno3D GeForce RTX 3060 12GB Twin X2 OC', brand: 'Inno3D', category: 'GPU' },
  { name: 'Galax GeForce RTX 3060 12GB EX 1-Click OC', brand: 'Galax', category: 'GPU' },

  // --- AMD Radeon RX 7000 (RDNA 3) ---
  { name: 'AMD Radeon RX 7900 XTX 24GB', brand: 'AMD', category: 'GPU' },
  { name: 'Sapphire Nitro+ AMD Radeon RX 7900 XTX 24GB', brand: 'Sapphire', category: 'GPU' },
  { name: 'AMD Radeon RX 7900 XT 20GB', brand: 'AMD', category: 'GPU' },
  { name: 'PowerColor Red Devil AMD Radeon RX 7900 XT 20GB', brand: 'PowerColor', category: 'GPU' },
  { name: 'AMD Radeon RX 7800 XT 16GB', brand: 'AMD', category: 'GPU' },
  { name: 'Sapphire Pulse AMD Radeon RX 7800 XT 16GB', brand: 'Sapphire', category: 'GPU' },
  { name: 'AMD Radeon RX 7700 XT 12GB', brand: 'AMD', category: 'GPU' },
  { name: 'AMD Radeon RX 7600 XT 16GB', brand: 'AMD', category: 'GPU' },
  { name: 'AMD Radeon RX 7600 8GB', brand: 'AMD', category: 'GPU' },

  // --- AMD Radeon RX 6000 (RDNA 2) ---
  { name: 'AMD Radeon RX 6900 XT 16GB', brand: 'AMD', category: 'GPU' },
  { name: 'AMD Radeon RX 6800 XT 16GB', brand: 'AMD', category: 'GPU' },
  { name: 'AMD Radeon RX 6700 XT 12GB', brand: 'AMD', category: 'GPU' },
  { name: 'AMD Radeon RX 6600 XT 8GB', brand: 'AMD', category: 'GPU' },
  { name: 'Sapphire Pulse AMD Radeon RX 6600 8GB', brand: 'Sapphire', category: 'GPU' },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  RAM (30 total)                                                ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // --- DDR5 ---
  { name: 'Corsair Vengeance DDR5 16GB (2x8GB) 5600MHz CL36', brand: 'Corsair', category: 'RAM' },
  { name: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL30', brand: 'Corsair', category: 'RAM' },
  { name: 'Corsair Vengeance DDR5 32GB (2x16GB) 6400MHz CL32', brand: 'Corsair', category: 'RAM' },
  { name: 'Corsair Dominator Platinum DDR5 32GB (2x16GB) 6600MHz CL32', brand: 'Corsair', category: 'RAM' },
  { name: 'Corsair Dominator Platinum DDR5 64GB (2x32GB) 6000MHz CL30', brand: 'Corsair', category: 'RAM' },
  { name: 'Kingston Fury Beast DDR5 16GB (2x8GB) 5600MHz CL36', brand: 'Kingston', category: 'RAM' },
  { name: 'Kingston Fury Beast DDR5 32GB (2x16GB) 6000MHz CL30', brand: 'Kingston', category: 'RAM' },
  { name: 'Kingston Fury Renegade DDR5 32GB (2x16GB) 6400MHz CL32', brand: 'Kingston', category: 'RAM' },
  { name: 'Kingston Fury Renegade DDR5 64GB (2x32GB) 6400MHz CL32', brand: 'Kingston', category: 'RAM' },
  { name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz CL30', brand: 'G.Skill', category: 'RAM' },
  { name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6400MHz CL32', brand: 'G.Skill', category: 'RAM' },
  { name: 'G.Skill Trident Z5 Neo DDR5 32GB (2x16GB) 6000MHz CL30', brand: 'G.Skill', category: 'RAM' },
  { name: 'G.Skill Trident Z5 RGB DDR5 64GB (2x32GB) 6000MHz CL30', brand: 'G.Skill', category: 'RAM' },
  { name: 'Crucial DDR5 16GB (1x16GB) 4800MHz CL40', brand: 'Crucial', category: 'RAM' },
  { name: 'Crucial DDR5 32GB (2x16GB) 5600MHz CL46', brand: 'Crucial', category: 'RAM' },
  { name: 'TeamGroup T-Force Delta RGB DDR5 32GB (2x16GB) 6000MHz CL30', brand: 'TeamGroup', category: 'RAM' },
  { name: 'ADATA XPG Lancer DDR5 32GB (2x16GB) 6000MHz CL30', brand: 'ADATA', category: 'RAM' },
  { name: 'ADATA XPG Lancer DDR5 16GB (2x8GB) 5600MHz CL36', brand: 'ADATA', category: 'RAM' },

  // --- DDR4 ---
  { name: 'Corsair Vengeance LPX DDR4 16GB (2x8GB) 3200MHz CL16', brand: 'Corsair', category: 'RAM' },
  { name: 'Corsair Vengeance LPX DDR4 16GB (2x8GB) 3600MHz CL18', brand: 'Corsair', category: 'RAM' },
  { name: 'Corsair Vengeance LPX DDR4 32GB (2x16GB) 3200MHz CL16', brand: 'Corsair', category: 'RAM' },
  { name: 'Corsair Vengeance LPX DDR4 32GB (2x16GB) 3600MHz CL18', brand: 'Corsair', category: 'RAM' },
  { name: 'Kingston Fury Beast DDR4 16GB (2x8GB) 3200MHz CL16', brand: 'Kingston', category: 'RAM' },
  { name: 'Kingston Fury Beast DDR4 32GB (2x16GB) 3200MHz CL16', brand: 'Kingston', category: 'RAM' },
  { name: 'G.Skill Ripjaws V DDR4 16GB (2x8GB) 3200MHz CL16', brand: 'G.Skill', category: 'RAM' },
  { name: 'G.Skill Ripjaws V DDR4 32GB (2x16GB) 3600MHz CL18', brand: 'G.Skill', category: 'RAM' },
  { name: 'G.Skill Trident Z Neo DDR4 32GB (2x16GB) 3600MHz CL16', brand: 'G.Skill', category: 'RAM' },
  { name: 'Crucial Ballistix DDR4 16GB (2x8GB) 3200MHz CL16', brand: 'Crucial', category: 'RAM' },
  { name: 'Crucial Ballistix DDR4 32GB (2x16GB) 3600MHz CL16', brand: 'Crucial', category: 'RAM' },
  { name: 'TeamGroup T-Force Vulcan Z DDR4 16GB (2x8GB) 3200MHz CL16', brand: 'TeamGroup', category: 'RAM' },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  Storage / SSD (30 total)                                      ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // --- NVMe PCIe 5.0 ---
  { name: 'Samsung 990 Evo Plus 1TB NVMe PCIe 5.0 M.2 SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Samsung 990 Evo Plus 2TB NVMe PCIe 5.0 M.2 SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Crucial T705 1TB NVMe PCIe 5.0 M.2 SSD', brand: 'Crucial', category: 'SSD' },
  { name: 'Crucial T705 2TB NVMe PCIe 5.0 M.2 SSD', brand: 'Crucial', category: 'SSD' },
  { name: 'Corsair MP700 Pro 2TB NVMe PCIe 5.0 M.2 SSD', brand: 'Corsair', category: 'SSD' },
  { name: 'Sabrent Rocket 4 Plus-G 4TB NVMe PCIe 5.0 M.2 SSD', brand: 'Sabrent', category: 'SSD' },

  // --- NVMe PCIe 4.0 ---
  { name: 'Samsung 990 Pro 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Samsung 990 Pro 4TB NVMe PCIe 4.0 M.2 SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Samsung 980 Pro 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Samsung 980 Pro 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'WD Black SN850X 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'WD', category: 'SSD' },
  { name: 'WD Black SN850X 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'WD', category: 'SSD' },
  { name: 'WD Black SN850X 4TB NVMe PCIe 4.0 M.2 SSD', brand: 'WD', category: 'SSD' },
  { name: 'WD Black SN770 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'WD', category: 'SSD' },
  { name: 'WD Black SN770 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'WD', category: 'SSD' },
  { name: 'Crucial P3 Plus 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'Crucial', category: 'SSD' },
  { name: 'Crucial P3 Plus 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'Crucial', category: 'SSD' },
  { name: 'SK Hynix Platinum P41 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'SK Hynix', category: 'SSD' },
  { name: 'SK Hynix Platinum P41 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'SK Hynix', category: 'SSD' },
  { name: 'Sabrent Rocket 4 Plus 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'Sabrent', category: 'SSD' },
  { name: 'Sabrent Rocket 4 Plus 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'Sabrent', category: 'SSD' },
  { name: 'Kingston NV2 1TB NVMe PCIe 4.0 M.2 SSD', brand: 'Kingston', category: 'SSD' },
  { name: 'Kingston NV2 2TB NVMe PCIe 4.0 M.2 SSD', brand: 'Kingston', category: 'SSD' },

  // --- SATA SSDs ---
  { name: 'Samsung 870 EVO 250GB SATA 2.5-inch SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Samsung 870 EVO 500GB SATA 2.5-inch SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Samsung 870 EVO 1TB SATA 2.5-inch SSD', brand: 'Samsung', category: 'SSD' },
  { name: 'Crucial MX500 500GB SATA 2.5-inch SSD', brand: 'Crucial', category: 'SSD' },
  { name: 'Crucial MX500 1TB SATA 2.5-inch SSD', brand: 'Crucial', category: 'SSD' },
  { name: 'WD Blue SA510 1TB SATA 2.5-inch SSD', brand: 'WD', category: 'SSD' },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  Power Supplies / PSU (20 total)                               ║
  // ╚══════════════════════════════════════════════════════════════════╝

  { name: 'Corsair CV550 550W 80 Plus Bronze Non-Modular PSU', brand: 'Corsair', category: 'PSU' },
  { name: 'Corsair CX650M 650W 80 Plus Bronze Semi-Modular PSU', brand: 'Corsair', category: 'PSU' },
  { name: 'Corsair RM750e 750W 80 Plus Gold Fully Modular PSU', brand: 'Corsair', category: 'PSU' },
  { name: 'Corsair RM850x 850W 80 Plus Gold Fully Modular PSU', brand: 'Corsair', category: 'PSU' },
  { name: 'Corsair RM1000x 1000W 80 Plus Gold Fully Modular PSU', brand: 'Corsair', category: 'PSU' },
  { name: 'Corsair HX1200 1200W 80 Plus Platinum Fully Modular PSU', brand: 'Corsair', category: 'PSU' },
  { name: 'Seasonic Focus GX-650 650W 80 Plus Gold Fully Modular PSU', brand: 'Seasonic', category: 'PSU' },
  { name: 'Seasonic Focus GX-750 750W 80 Plus Gold Fully Modular PSU', brand: 'Seasonic', category: 'PSU' },
  { name: 'Seasonic Focus GX-850 850W 80 Plus Gold Fully Modular PSU', brand: 'Seasonic', category: 'PSU' },
  { name: 'Seasonic Focus PX-850 850W 80 Plus Platinum Fully Modular PSU', brand: 'Seasonic', category: 'PSU' },
  { name: 'Seasonic Prime TX-1000 1000W 80 Plus Titanium Fully Modular PSU', brand: 'Seasonic', category: 'PSU' },
  { name: 'MSI MAG A650BN 650W 80 Plus Bronze Non-Modular PSU', brand: 'MSI', category: 'PSU' },
  { name: 'MSI MAG A750GL 750W 80 Plus Gold Fully Modular PSU', brand: 'MSI', category: 'PSU' },
  { name: 'MSI MEG Ai1300P 1300W 80 Plus Platinum Fully Modular PSU', brand: 'MSI', category: 'PSU' },
  { name: 'Gigabyte UD750GM 750W 80 Plus Gold Fully Modular PSU', brand: 'Gigabyte', category: 'PSU' },
  { name: 'Gigabyte UD850GM PG5 850W 80 Plus Gold Fully Modular PSU', brand: 'Gigabyte', category: 'PSU' },
  { name: 'Antec NeoECO Gold 650W 80 Plus Gold Semi-Modular PSU', brand: 'Antec', category: 'PSU' },
  { name: 'Antec HCG-850 Gold 850W 80 Plus Gold Fully Modular PSU', brand: 'Antec', category: 'PSU' },
  { name: 'Cooler Master MWE 550W 80 Plus Bronze Non-Modular PSU', brand: 'Cooler Master', category: 'PSU' },
  { name: 'Deepcool PQ750M 750W 80 Plus Gold Fully Modular PSU', brand: 'Deepcool', category: 'PSU' },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  CPU Coolers (15 total)                                        ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // --- Air Coolers ---
  { name: 'Noctua NH-D15 chromax.black Dual Tower CPU Cooler', brand: 'Noctua', category: 'Cooler' },
  { name: 'Noctua NH-D12L Low-Profile Dual Tower CPU Cooler', brand: 'Noctua', category: 'Cooler' },
  { name: 'Noctua NH-U12A chromax.black CPU Air Cooler', brand: 'Noctua', category: 'Cooler' },
  { name: 'Arctic Freezer 34 eSports DUO CPU Air Cooler', brand: 'Arctic', category: 'Cooler' },
  { name: 'Arctic Freezer 50 eSports CPU Air Cooler', brand: 'Arctic', category: 'Cooler' },
  { name: 'Thermalright Peerless Assassin 120 SE CPU Air Cooler', brand: 'Thermalright', category: 'Cooler' },
  { name: 'be quiet! Dark Rock Pro 5 CPU Air Cooler', brand: 'be quiet!', category: 'Cooler' },
  { name: 'Deepcool AK620 Dual Tower CPU Air Cooler', brand: 'Deepcool', category: 'Cooler' },

  // --- AIO Liquid Coolers ---
  { name: 'Corsair iCUE H150i Elite Capellix XT 360mm AIO Liquid Cooler', brand: 'Corsair', category: 'Cooler' },
  { name: 'Corsair iCUE H100i RGB Pro XT 240mm AIO Liquid Cooler', brand: 'Corsair', category: 'Cooler' },
  { name: 'NZXT Kraken X73 360mm AIO Liquid Cooler', brand: 'NZXT', category: 'Cooler' },
  { name: 'NZXT Kraken X63 280mm AIO Liquid Cooler', brand: 'NZXT', category: 'Cooler' },
  { name: 'NZXT Kraken X53 240mm AIO Liquid Cooler', brand: 'NZXT', category: 'Cooler' },
  { name: 'Arctic Liquid Freezer II 360mm AIO Liquid Cooler', brand: 'Arctic', category: 'Cooler' },
  { name: 'Deepcool LT720 360mm AIO Liquid Cooler', brand: 'Deepcool', category: 'Cooler' },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  Motherboards (10 total) — 5 AMD AM5 + 5 Intel LGA1700        ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // --- AMD AM5 ---
  { name: 'ASUS ROG Strix X870E-E Gaming WiFi ATX Motherboard', brand: 'ASUS', category: 'Motherboard' },
  { name: 'MSI MAG B850 Tomahawk WiFi ATX Motherboard', brand: 'MSI', category: 'Motherboard' },
  { name: 'Gigabyte B650 Aorus Elite AX V2 ATX Motherboard', brand: 'Gigabyte', category: 'Motherboard' },
  { name: 'ASRock B650M Pro RS WiFi Micro-ATX Motherboard', brand: 'ASRock', category: 'Motherboard' },
  { name: 'MSI MPG X870E Carbon WiFi ATX Motherboard', brand: 'MSI', category: 'Motherboard' },

  // --- Intel LGA1700 ---
  { name: 'ASUS ROG Strix Z790-E Gaming WiFi II ATX Motherboard', brand: 'ASUS', category: 'Motherboard' },
  { name: 'MSI MAG Z790 Tomahawk WiFi ATX Motherboard', brand: 'MSI', category: 'Motherboard' },
  { name: 'Gigabyte Z790 Aorus Elite AX DDR5 ATX Motherboard', brand: 'Gigabyte', category: 'Motherboard' },
  { name: 'ASRock B760M Pro RS WiFi Micro-ATX Motherboard', brand: 'ASRock', category: 'Motherboard' },
  { name: 'ASUS ROG Maximus Z890 Hero ATX Motherboard', brand: 'ASUS', category: 'Motherboard' },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  PC Cases / Cabinet (5 total)                                  ║
  // ╚══════════════════════════════════════════════════════════════════╝

  { name: 'Lian Li Lancool 216 Mid Tower ATX Cabinet', brand: 'Lian Li', category: 'Cabinet' },
  { name: 'NZXT H7 Flow Mid Tower ATX Cabinet', brand: 'NZXT', category: 'Cabinet' },
  { name: 'Corsair 4000D Airflow Mid Tower ATX Cabinet', brand: 'Corsair', category: 'Cabinet' },
  { name: 'Fractal Design North Mid Tower ATX Cabinet', brand: 'Fractal Design', category: 'Cabinet' },
  { name: 'Phanteks Eclipse G360A Mid Tower ATX Cabinet', brand: 'Phanteks', category: 'Cabinet' },
];

// ── Seed User ────────────────────────────────────────────────────────

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

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   PCForge Component Seeder — 200 Components       ║');
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

  // 2. Seed user
  console.log('→ Resolving seed admin user...');
  const createdBy = await getOrCreateSeedUser();
  console.log('');

  // 3. Clear existing seeded components
  console.log('→ Clearing existing components...');
  const deleteResult = await Component.deleteMany({});
  console.log(`  ✓ Removed ${deleteResult.deletedCount} existing components\n`);

  // 4. Build component documents
  console.log('→ Building component documents...');
  const documents = RAW_COMPONENTS.map((raw) => {
    const resolved = resolveSpecifications({
      name: raw.name,
      brand: raw.brand,
      category: raw.category,
    });

    return {
      name: raw.name,
      brand: raw.brand,
      category: raw.category,
      description: resolved.inferredDescription,
      images: [],
      specifications: resolved.flatSpecs,
      compatibility: resolved.compatibility,
      prices: urls(raw.name),
      stockStatus: 'In Stock',
      tags: [raw.category.toLowerCase(), raw.brand.toLowerCase()],
      createdBy,
    };
  });

  // 5. Category counts
  const categoryCounts = {};
  for (const doc of documents) {
    categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
  }
  console.log(`  ✓ ${documents.length} components prepared:`);
  for (const [cat, count] of Object.entries(categoryCounts)) {
    console.log(`      ${cat}: ${count}`);
  }
  console.log('');

  // 6. Insert
  console.log('→ Inserting into MongoDB...');
  const inserted = await Component.insertMany(documents, { ordered: false });
  console.log(`  ✓ Inserted ${inserted.length} components\n`);

  // 7. Verify
  const totalInDB = await Component.countDocuments();
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log(`║  ✅ Seeding complete!                              ║`);
  console.log(`║  Total components in DB: ${String(totalInDB).padEnd(24)}║`);
  console.log('╠═══════════════════════════════════════════════════╣');
  for (const [cat, count] of Object.entries(categoryCounts)) {
    console.log(`║  ${cat.padEnd(15)} ${String(count).padEnd(32)}║`);
  }
  console.log('╚═══════════════════════════════════════════════════╝\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n✘ Fatal error:', err);
  process.exit(1);
});
