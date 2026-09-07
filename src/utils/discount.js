// Single source of truth for the 10% frame discount (frontend).
// Applies to ONLY these three products (matched by slug, code, or name):
//   Japanese Quotes (ESKFRM0005/eskfrm0005), Zen Temple 02 (ESKFRM0004/eskfrm0004),
//   Zen Temple 01 (ESKFRM0003/eskfrm0003)
export const DISCOUNT_PERCENT = 10;

const DISCOUNT_SLUGS = new Set(['eskfrm0003', 'eskfrm0004', 'eskfrm0005']);
const DISCOUNT_CODES = new Set(['ESKFRM0003', 'ESKFRM0004', 'ESKFRM0005']);
const DISCOUNT_NAMES = new Set(['zen temple 01', 'zen temple 02', 'japanese quotes']);

export function isDiscountedProduct(p) {
  if (!p) return false;
  if (typeof p === 'string') {
    const s = p.trim().toLowerCase();
    return DISCOUNT_SLUGS.has(s) || DISCOUNT_CODES.has(p.trim().toUpperCase()) || DISCOUNT_NAMES.has(s);
  }
  const slug = String(p.slug || '').trim().toLowerCase();
  if (slug && DISCOUNT_SLUGS.has(slug)) return true;
  const code = String(p.product_code || p.productCode || '').trim().toUpperCase();
  if (code && DISCOUNT_CODES.has(code)) return true;
  const name = String(p.product_name || p.name || '').trim().toLowerCase();
  if (name && DISCOUNT_NAMES.has(name)) return true;
  return false;
}

// Returns the sale price (rounded). Pass the base/MRP price explicitly when
// the caller overrides it (e.g. frame size variants on the Product page).
export function getSalePrice(product, basePrice) {
  const base = Number(basePrice ?? product?.price ?? product?.mrp);
  if (!Number.isFinite(base)) return basePrice ?? product?.price;
  if (!isDiscountedProduct(product)) return base;
  return Math.round(base * (100 - DISCOUNT_PERCENT) / 100);
}

// { mrp, price, discounted, percent } — price is what the customer pays.
export function priceInfo(product, basePrice) {
  const mrp = Number(basePrice ?? product?.mrp ?? product?.price);
  const price = getSalePrice(product, mrp);
  const discounted = price < mrp;
  return { mrp, price, discounted, percent: discounted ? DISCOUNT_PERCENT : 0 };
}
