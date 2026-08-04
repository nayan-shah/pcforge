import { createStandardOffer } from '../adapters/offerContract.js';

export default function normalizeVedant(rawData = {}) {
  const offer = createStandardOffer('Vedant', {
    productName: rawData.name,
    price: rawData.price,
    currency: rawData.currency,
    productUrl: rawData.url,
    image: rawData.image,
    availability: rawData.itemStatus,
    lastUpdated: rawData.updated,
  });

  return offer;
}
