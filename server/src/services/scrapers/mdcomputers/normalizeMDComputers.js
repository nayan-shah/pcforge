import { createStandardOffer } from '../adapters/offerContract.js';

export default function normalizeMDComputers(rawData = {}) {
  const offer = createStandardOffer('MDComputers', {
    productName: rawData.name,
    price: rawData.currentPrice,
    currency: rawData.currency,
    productUrl: rawData.productUrl,
    image: rawData.imageUrl,
    availability: rawData.stockStatus,
    lastUpdated: rawData.fetchedAt,
  });

  return offer;
}
