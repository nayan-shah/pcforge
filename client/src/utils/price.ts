import type { ComponentDetail } from '../types/component';

export function getLowestPrice(component: ComponentDetail) {
  if (!component.prices || component.prices.length === 0) return null;
  let lowest = Infinity;
  let currency = 'INR';
  for (const p of component.prices) {
    const v = p.price ?? p.currentPrice ?? Infinity;
    if (v < lowest) {
      lowest = v;
      currency = p.currency ?? 'INR';
    }
  }
  return lowest === Infinity ? null : { price: lowest, currency };
}
