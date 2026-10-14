import { create } from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import Component from '../models/Component.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const client = create({
  timeout: 10000,
  maxRedirects: 5,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/json,image/*,*/*;q=0.8',
  },
  maxContentLength: 8 * 1024 * 1024,
});

const BLOCKED_URL_PARTS = [
  'logo',
  'banner',
  'placeholder',
  'sprite',
  'no-image',
  'no_image',
  'missing',
  'not-found',
  'default',
  'avatar',
  'icon',
  'teaser',
  'unsplash',
  'picsum',
  'placehold',
];

const OFFICIAL_SITES = {
  AMD: { host: 'amd.com', search: 'https://www.amd.com/en/search?search=' },
  Intel: { host: 'intel.com', search: 'https://www.intel.com/content/www/us/en/search.html?query=' },
  NVIDIA: { host: 'nvidia.com', search: 'https://www.nvidia.com/en-us/search/?q=' },
  Samsung: { host: 'samsung.com', search: 'https://www.samsung.com/us/search/searchMain?search=' },
  Crucial: { host: 'crucial.com', search: 'https://www.crucial.com/search?text=' },
  WD: { host: 'westerndigital.com', search: 'https://www.westerndigital.com/search?q=' },
  Kingston: { host: 'kingston.com', search: 'https://www.kingston.com/en/search?keyword=' },
  ASUS: { host: 'asus.com', search: 'https://www.asus.com/search/?q=' },
  MSI: { host: 'msi.com', search: 'https://www.msi.com/search?keyword=' },
  Gigabyte: { host: 'gigabyte.com', search: 'https://www.gigabyte.com/search?keyword=' },
  Noctua: { host: 'noctua.at', search: 'https://www.noctua.at/en/search?query=' },
  Corsair: { host: 'corsair.com', search: 'https://www.corsair.com/us/en/search?search=' },
  NZXT: { host: 'nzxt.com', search: 'https://nzxt.com/search?query=' },
  Arctic: { host: 'arctic.de', search: 'https://www.arctic.de/en/search?sSearch=' },
  Seasonic: { host: 'seasonic.com', search: 'https://seasonic.com/search/?q=' },
  Deepcool: { host: 'deepcool.com', search: 'https://www.deepcool.com/search?keyword=' },
  Sabrent: { host: 'sabrent.com', search: 'https://sabrent.com/search?q=' },
  'be quiet!': { host: 'bequiet.com', search: 'https://www.bequiet.com/en/search?search=' },
  Thermaltake: { host: 'thermaltake.com', search: 'https://www.thermaltake.com/search?keyword=' },
  'Lian Li': { host: 'lian-li.com', search: 'https://lian-li.com/?s=' },
  Antec: { host: 'antec.com', search: 'https://www.antec.com/search?keyword=' },
  ASRock: { host: 'asrock.com', search: 'https://www.asrock.com/search/?q=' },
  Phanteks: { host: 'phanteks.com', search: 'https://www.phanteks.com/search.html?q=' },
};

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const modelMarkers = (name) => {
  const normalized = normalizeText(name);
  const markers = new Set([normalized]);
  const patterns = [
    /\bryzen\s+[3579]\s+\d{4}[a-z0-9]*\b/g,
    /\bcore\s+i[3579]\s*[- ]?\s*\d{3,5}[a-z0-9]*\b/g,
    /\b(?:rtx|gtx)\s*\d{3,4}(?:\s*(?:ti|super))?\b/g,
    /\brx\s*\d{3,4}(?:\s*xt)?\b/g,
    /\b\d{3,4}\s+(?:pro|plus|evo|xt)\b/g,
    /\bp\d\s+plus\b/g,
  ];

  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) markers.add(match[0].trim());
  }

  for (const word of normalized.split(/\s+/)) {
    if (
      /[a-z]/.test(word) &&
      /\d/.test(word) &&
      !/^(?:ddr\d|pcie\d|cl\d+|\d+x\d+gb|\d+(?:tb|gb|mhz|ghz|mm|w))/.test(word)
    ) {
      markers.add(word);
    }
  }

  return [...markers].filter((marker) => marker.length >= 3);
};

const hasModel = (text, component) => {
  const normalized = normalizeText(text);
  return modelMarkers(component.name).some((marker) => normalized.includes(marker));
};

const categoryMatches = (component, text) => {
  const normalized = normalizeText(text);
  const wrongType = {
    SSD: /\b(refrigerator|fridge|ram|memory module|dimm)\b/,
    CPU: /\b(refrigerator|fridge|logo|graphics card|ram|memory module)\b/,
    GPU: /\b(refrigerator|fridge|ram|memory module|processor only)\b/,
    RAM: /\b(refrigerator|fridge|ssd|nvme|solid state drive)\b/,
  };
  if (wrongType[component.category]?.test(normalized)) return false;

  const typeTerms = {
    SSD: /\b(ssd|solid state|nvme|m 2|storage)\b/,
    CPU: /\b(cpu|processor|ryzen|threadripper|xeon|core i[3579])\b/,
    GPU: /\b(gpu|graphics card|geforce|radeon|graphics)\b/,
    RAM: /\b(ram|memory|dimm|ddr[345])\b/,
    Motherboard: /\b(motherboard|mainboard)\b/,
    HDD: /\b(hdd|hard drive|hard disk)\b/,
    PSU: /\b(power supply|psu)\b/,
    Cooler: /\b(cooler|heatsink|liquid cooling|aio)\b/,
    Cabinet: /\b(case|cabinet|chassis)\b/,
    Monitor: /\b(monitor|display)\b/,
    Keyboard: /\b(keyboard)\b/,
    Mouse: /\b(mouse)\b/,
  };
  return typeTerms[component.category]?.test(normalized) ?? false;
};

const isBlockedUrl = (url) => {
  const normalized = String(url || '').toLowerCase();
  return BLOCKED_URL_PARTS.some((part) => normalized.includes(part));
};

const imageDimensions = (buffer) => {
  if (buffer.length < 24) return null;

  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buffer.toString('ascii', 12, 16);
    if (kind === 'VP8X') {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
    if (kind === 'VP8 ') {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    }
    if (kind === 'VP8L' && buffer[20] === 0x2f) {
      return {
        width: 1 + (((buffer[22] & 0x3f) << 8) | buffer[21]),
        height: 1 + (((buffer[23] & 0x0f) << 10) | (buffer[22] >> 6) | (buffer[24] << 2)),
      };
    }
  }

  if (buffer.toString('ascii', 0, 4) === 'GIF8') {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if (buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      if (length < 2) break;
      offset += length + 2;
    }
  }

  return null;
};

const pageTitle = ($) =>
  $('meta[property="og:title"]').attr('content') ||
  $('meta[name="twitter:title"]').attr('content') ||
  $('title').first().text() ||
  '';

const getPage = async (url) => {
  const response = await client.get(url, { responseType: 'text' });
  if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
  return cheerio.load(response.data || '');
};

const pageImages = ($, pageUrl) => {
  const title = pageTitle($).trim();
  const candidates = [];
  const seen = new Set();
  const add = (url, alt = '') => {
    if (!url) return;
    try {
      const absolute = new URL(url, pageUrl).toString();
      if (seen.has(absolute) || isBlockedUrl(absolute)) return;
      seen.add(absolute);
      candidates.push({ url: absolute, title, alt: String(alt || '').trim() });
    } catch {
      return;
    }
  };

  add($('meta[property="og:image"]').attr('content'));
  add($('meta[name="twitter:image"]').attr('content'));
  add($('meta[itemprop="image"]').attr('content'));

  const mainGallery = [
    '.woocommerce-product-gallery img',
    '[class*="product-gallery"] img',
    '[class*="product-image"] img',
    '[data-gallery] img',
    'main img',
  ].join(', ');
  $(mainGallery).each((_, element) => {
    const $image = $(element);
    add(
      $image.attr('data-src') || $image.attr('data-lazy-src') || $image.attr('src'),
      $image.attr('alt')
    );
  });

  $('img[alt]').each((_, element) => {
    const $image = $(element);
    add(
      $image.attr('data-src') || $image.attr('data-lazy-src') || $image.attr('src'),
      $image.attr('alt')
    );
  });
  return candidates;
};

const validateCandidate = async (candidate, component, usedUrls) => {
  if (usedUrls.has(candidate.url) || isBlockedUrl(candidate.url)) return null;

  const pageConfirmsModel = hasModel(candidate.title, component) || hasModel(candidate.alt, component);
  if (!pageConfirmsModel) return null;

  const productContext = `${candidate.title} ${candidate.alt}`;
  if (!categoryMatches(component, productContext)) return null;

  try {
    const response = await client.get(candidate.url, { responseType: 'arraybuffer' });
    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    if (response.status !== 200 || !contentType.startsWith('image/')) return null;
    const dimensions = imageDimensions(Buffer.from(response.data));
    if (!dimensions || dimensions.width < 120 || dimensions.height < 120) return null;
    if (dimensions.width / dimensions.height > 3 || dimensions.height / dimensions.width > 3) return null;
    return candidate.url;
  } catch {
    return null;
  }
};

const exactRetailerCandidates = async (component) => {
  const sources = await Promise.all(
    (component.prices || []).map(async (price) => {
      if (!price?.productUrl) return [];
      const candidates = [];
      try {
        const $ = await getPage(price.productUrl);
        for (const candidate of pageImages($, price.productUrl)) {
          candidates.push({ ...candidate, source: `Retailer: ${price.productUrl}` });
        }
      } catch (error) {
        console.warn(`  Retailer unavailable (${price.productUrl}): ${error.message}`);
      }
      return candidates;
    })
  );
  return sources.flat();
};

const exactManufacturerCandidates = async (component) => {
  const site = OFFICIAL_SITES[component.brand];
  if (!site) return [];

  const searchUrl = `${site.search}${encodeURIComponent(component.name)}`;
  try {
    const $ = await getPage(searchUrl);
    const productPages = new Set();
    $('a[href]').each((_, element) => {
      const $link = $(element);
      const label = `${$link.text()} ${$link.attr('title') || ''}`;
      if (!hasModel(label, component)) return;
      try {
        const url = new URL($link.attr('href'), searchUrl);
        if (
          (url.hostname === site.host || url.hostname.endsWith(`.${site.host}`)) &&
          url.protocol === 'https:' &&
          !/\/(?:catalog|category|search)(?:\/|$)/i.test(url.pathname)
        ) {
          productPages.add(url.toString());
        }
      } catch {
        return;
      }
    });

    const candidates = [];
    for (const productUrl of [...productPages].slice(0, 5)) {
      try {
        const productPage = await getPage(productUrl);
        for (const candidate of pageImages(productPage, productUrl)) {
          candidates.push({ ...candidate, source: `Manufacturer: ${productUrl}` });
        }
      } catch (error) {
        console.warn(`  Manufacturer page unavailable (${productUrl}): ${error.message}`);
      }
    }
    return candidates;
  } catch (error) {
    console.warn(`  Manufacturer search unavailable (${searchUrl}): ${error.message}`);
    return [];
  }
};

const exactImageSearchCandidates = async (component) => {
  const key = process.env.BING_IMAGE_SEARCH_KEY;
  if (!key) {
    console.warn('  Bing Image Search API skipped: BING_IMAGE_SEARCH_KEY is not configured.');
    return [];
  }

  const endpoint = process.env.BING_IMAGE_SEARCH_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/images/search';
  try {
    const response = await client.get(endpoint, {
      params: { q: `"${component.name}" product`, count: 20, safeSearch: 'Strict' },
      headers: { 'Ocp-Apim-Subscription-Key': key },
    });
    if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

    return (response.data?.value || []).map((result) => ({
      url: result.contentUrl,
      title: result.hostPageTitle || result.name || '',
      alt: result.name || '',
      source: 'Bing Image Search API (exact model + product)',
    }));
  } catch (error) {
    console.warn(`  Image search unavailable for "${component.name}": ${error.message}`);
    return [];
  }
};

const resolveImage = async (component, usedUrls) => {
  const sources = [
    exactRetailerCandidates,
    exactManufacturerCandidates,
    exactImageSearchCandidates,
  ];

  for (const getCandidates of sources) {
    const candidates = await getCandidates(component);
    for (const candidate of candidates) {
      const imageUrl = await validateCandidate(candidate, component, usedUrls);
      if (imageUrl && !usedUrls.has(imageUrl)) {
        usedUrls.add(imageUrl);
        return { imageUrl, source: candidate.source };
      }
    }
  }
  return null;
};

const main = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set.');

  await mongoose.connect(process.env.MONGODB_URI);
  const components = await Component.collection.find({}).toArray();
  const names = new Set();
  for (const component of components) {
    if (!component.name) throw new Error(`Component ${component._id} has no name; refusing to update by a non-exact key.`);
    if (names.has(component.name)) throw new Error(`Duplicate component name "${component.name}"; refusing ambiguous image updates.`);
    names.add(component.name);
  }

  console.log(`Loaded ${components.length} components. Clearing existing image values that lack verifiable model metadata.`);
  for (const component of components) {
    if (component.images?.length) {
      const result = await Component.collection.updateOne(
        { name: component.name },
        { $set: { images: [] } }
      );
      if (result.matchedCount !== 1) throw new Error(`Exact-name reset failed for "${component.name}".`);
    }
  }

  const usedUrls = new Set();
  const report = new Array(components.length);
  let nextIndex = 0;
  let updatedCount = 0;
  let nullCount = 0;
  const processNext = async () => {
    while (nextIndex < components.length) {
      const index = nextIndex;
      nextIndex += 1;
      const component = components[index];
      console.log(`Checking exact model: ${component.name}`);
      const match = await resolveImage(component, usedUrls);
      if (!match) {
        nullCount += 1;
        report[index] = { name: component.name, imageUrl: 'null', source: 'No verified source' };
        console.warn(`  No verified image; leaving null: ${component.name}`);
        continue;
      }

      const result = await Component.collection.updateOne(
        { name: component.name },
        { $set: { images: [match.imageUrl] } }
      );
      if (result.matchedCount !== 1) throw new Error(`Exact-name update failed for "${component.name}".`);
      updatedCount += 1;
      report[index] = { name: component.name, imageUrl: match.imageUrl, source: match.source };
    }
  };

  await Promise.all(Array.from({ length: Math.min(4, components.length) }, processNext));

  console.log('\n=== Component image report ===');
  console.log(`Updated count: ${updatedCount}`);
  console.log(`Null count: ${nullCount}`);
  console.log('\n| Component name | Image URL | Source used |');
  console.log('|---|---|---|');
  for (const row of report) {
    console.log(`| ${row.name.replaceAll('|', '\\|')} | ${row.imageUrl} | ${row.source.replaceAll('|', '\\|')} |`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Fatal error updating component images:', error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
