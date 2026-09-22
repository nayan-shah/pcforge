export const STORE_COLORS: Record<string, string> = {
  MDComputers: 'from-blue-600 to-blue-700',
  PrimeABGB: 'from-orange-500 to-orange-600',
  Vedant: 'from-emerald-600 to-emerald-700',
  'Vedant Computers': 'from-emerald-600 to-emerald-700',
  PCStudio: 'from-purple-600 to-purple-700',
  Amazon: 'from-yellow-500 to-orange-500',
  'Amazon India': 'from-yellow-500 to-orange-500',
};

/** Ordered list of the 4 primary Indian retailers the scrapers cover. */
export const PRIMARY_RETAILERS = ['MDComputers', 'Vedant', 'PrimeABGB', 'PCStudio'] as const;
export type PrimaryRetailer = typeof PRIMARY_RETAILERS[number];
