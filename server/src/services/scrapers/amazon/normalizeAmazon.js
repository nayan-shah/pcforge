import { createStandardOffer } from '../adapters/offerContract.js';

export default function normalizeAmazon(rawData = {}) {
  const offer = createStandardOffer('Amazon', {
    productName: rawData.title,
    price: rawData.price,
    currency: rawData.currency,
    productUrl: rawData.url,
    image: rawData.image,
    availability: rawData.availability,
    lastUpdated: rawData.updatedAt,
  });

  return offer;
}
