export const REQUIRED_OFFER_FIELDS = [
  'storeName',
  'productName',
  'price',
  'currency',
  'productUrl',
  'image',
  'availability',
  'lastUpdated',
];

export const normalizeOfferShape = (raw = {}) => ({
  storeName: String(raw.storeName ?? '').trim(),
  productName: String(raw.productName ?? '').trim(),
  price: Number(raw.price ?? 0),
  currency: String(raw.currency ?? 'INR').trim().toUpperCase(),
  productUrl: String(raw.productUrl ?? '').trim(),
  image: String(raw.image ?? '').trim(),
  availability: String(raw.availability ?? 'Unknown').trim(),
  lastUpdated: String(raw.lastUpdated ?? new Date().toISOString()).trim(),
});

export const logInvalidOffer = (storeName, reason, payload = {}) => {
  console.warn(`[Scraper Adapter] Invalid offer for ${storeName}: ${reason}`, JSON.stringify(payload));
};

export const validateOffer = (offer, storeName) => {
  const missingFields = REQUIRED_OFFER_FIELDS.filter((field) => {
    const value = offer?.[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missingFields.length > 0) {
    logInvalidOffer(storeName, `Missing required fields: ${missingFields.join(', ')}`, offer);
    return { isValid: false, missingFields };
  }

  if (Number.isNaN(Number(offer.price)) || Number(offer.price) < 0) {
    logInvalidOffer(storeName, 'Price must be a non-negative number.', offer);
    return { isValid: false, missingFields: ['price'] };
  }

  if (!/^https?:\/\//i.test(String(offer.productUrl))) {
    logInvalidOffer(storeName, 'productUrl must be a valid absolute URL.', offer);
    return { isValid: false, missingFields: ['productUrl'] };
  }

  return { isValid: true, missingFields: [] };
};

export const createStandardOffer = (storeName, rawPayload = {}) => {
  const offer = normalizeOfferShape({
    ...rawPayload,
    storeName,
  });

  const result = validateOffer(offer, storeName);
  return {
    ...offer,
    isValid: result.isValid,
    missingFields: result.missingFields,
  };
};
