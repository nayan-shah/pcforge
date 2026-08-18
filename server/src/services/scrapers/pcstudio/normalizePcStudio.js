import { createStandardOffer } from "../adapters/offerContract.js";

export default function normalizePcStudio(raw = {}) {
  return createStandardOffer("PCStudio", {
    productName: raw.product_name,
    price: raw.sale_price,
    currency: raw.currency_code,
    productUrl: raw.link,
    image: raw.image_url,
    availability: raw.stock,
    lastUpdated: raw.last_update,
  });
}
