const GENERIC_PRODUCT_WORDS = new Set([
  'and',
  'card',
  'case',
  'core',
  'cores',
  'cooler',
  'cooling',
  'cpu',
  'desktop',
  'display',
  'drive',
  'edition',
  'for',
  'graphics',
  'hdd',
  'keyboard',
  'kit',
  'memory',
  'monitor',
  'motherboard',
  'mouse',
  'nvme',
  'pc',
  'power',
  'processor',
  'psu',
  'ram',
  'solid',
  'ssd',
  'state',
  'storage',
  'supply',
  'the',
  'thread',
  'threads',
  'tower',
  'with',
  'wired',
  'wireless',
]);
const DISTINCTIVE_VARIANTS = ['gre', 'super', 'ti', 'xt', 'xtx', 'x3d'];
const PRODUCT_FAMILY_TOKENS = ['rx'];

const tokens = (value) =>
  String(value ?? '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];

const requiredModelTokens = (value) => [
  ...new Set(
    tokens(value).filter((token) => {
      if (GENERIC_PRODUCT_WORDS.has(token)) return false;
      return (
        token.length >= 3 ||
        (token.length > 1 && /\d/.test(token)) ||
        DISTINCTIVE_VARIANTS.includes(token) ||
        PRODUCT_FAMILY_TOKENS.includes(token)
      );
    }),
  ),
];

const joinedTokenSet = (value) => {
  const words = tokens(value);
  const joined = words.map((word, index) => `${word}${words[index + 1] ?? ''}`);
  return new Set([...words, ...joined]);
};

export const isExactProductTitle = (componentName, brand, productTitle) => {
  const required = requiredModelTokens(componentName);
  if (required.length === 0 || !productTitle) return false;

  const titleTokens = joinedTokenSet(productTitle);
  if (!required.every((token) => titleTokens.has(token))) return false;

  const componentTokens = tokens(componentName);
  const componentTokenSet = new Set(componentTokens);
  const titleTokenSet = new Set(tokens(productTitle));
  if (
    DISTINCTIVE_VARIANTS.some(
      (variant) => titleTokenSet.has(variant) && !componentTokenSet.has(variant),
    )
  ) {
    return false;
  }
  for (let index = 0; index < componentTokens.length - 1; index++) {
    const family = componentTokens[index];
    const series = componentTokens[index + 1];
    if (
      ['ryzen', 'core', 'geforce', 'radeon', 'rtx', 'rx'].includes(family) &&
      /^\d$/.test(series) &&
      (!titleTokens.has(family) || !titleTokens.has(series))
    ) {
      return false;
    }
  }

  const requiredBrand = requiredModelTokens(brand);
  return requiredBrand.every((token) => titleTokens.has(token));
};

export const getProductSearchQueries = (componentName) => {
  const original = String(componentName ?? '').trim();
  const concise = original
    .replace(/\b\d+\s*[- ]\s*(?:core|threads?)\b/gi, ' ')
    .replace(/\b(?:processor|desktop|graphics|card|gpu|cpu)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return [...new Set([concise, original].filter(Boolean))];
};

export const isDirectProductUrl = (store, rawUrl) => {
  try {
    const url = new URL(rawUrl);
    const isIndexSearch =
      /^\/index\.php$/i.test(url.pathname) &&
      (url.searchParams.has('search') || url.searchParams.has('route'));
    const allowedHosts = {
      MDComputers: ['mdcomputers.in'],
      Vedant: ['vedantcomputers.com'],
      PrimeABGB: ['primeabgb.com'],
      PCStudio: ['pcstudio.in'],
    }[store];

    if (
      !allowedHosts?.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)) ||
      !['http:', 'https:'].includes(url.protocol) ||
      /(?:^|\/)(?:search|category|product-category|shop|tag)(?:\/|$)/i.test(url.pathname) ||
      isIndexSearch ||
      /(?:\?|&)(?:s|q)=/i.test(url.search)
    ) {
      return false;
    }

    return url.pathname !== '/' && url.pathname.split('/').filter(Boolean).length > 0;
  } catch {
    return false;
  }
};
