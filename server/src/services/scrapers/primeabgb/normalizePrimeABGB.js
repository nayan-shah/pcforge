import { createStandardOffer } from '../adapters/offerContract.js';

export default function normalizePrimeABGB(rawData = {}) {
  const offer = createStandardOffer('PrimeABGB', {
    productName: rawData.product_name,
    price: rawData.sale_price,
    currency: rawData.currency_code,
    productUrl: rawData.link,
    image: rawData.image_url,
    availability: rawData.stock,
    lastUpdated: rawData.last_update,
  });

  return offer;
}
