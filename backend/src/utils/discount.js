// Single source of truth for the 10% frame discount (backend, CommonJS).
// Applies to ONLY: Japanese Quotes (ESKFRM0005), Zen Temple 02 (ESKFRM0004),
// Zen Temple 01 (ESKFRM0003). Matches frontend src/utils/discount.js logic.
const DISCOUNT_PERCENT = 10;

const DISCOUNT_SLUGS = new Set(['eskfrm0003', 'eskfrm0004', 'eskfrm0005']);
const DISCOUNT_CODES = new Set(['ESKFRM0003', 'ESKFRM0004', 'ESKFRM0005']);
const DISCOUNT_NAMES = new Set(['zen temple 01', 'zen temple 02', 'japanese quotes']);

function isDiscountedProduct(p) {
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

function getSalePrice(product, basePrice) {
  const base = Number(basePrice !== undefined ? basePrice : product && (product.price !== undefined ? product.price : product.mrp));
  if (!Number.isFinite(base)) return basePrice !== undefined ? basePrice : product && product.price;
  if (!isDiscountedProduct(product)) return base;
  return Math.round((base * (100 - DISCOUNT_PERCENT)) / 100);
}

module.exports = { DISCOUNT_PERCENT, isDiscountedProduct, getSalePrice };
