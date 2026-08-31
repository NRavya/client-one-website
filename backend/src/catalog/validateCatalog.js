import catalog from './masterCatalog.json' with { type: 'json' };

const map = new Map(catalog.map(c => [c.product_code, c.product_name]));

export function validateProduct(code, name) {
  if (!code || !name) return { valid: false, reason: 'Missing code or name' };
  if (!map.has(code)) return { valid: false, reason: `Unknown product_code: ${code}` };
  if (map.get(code) !== name) return { valid: false, reason: `Mismatch for ${code}: expected "${map.get(code)}" got "${name}"` };
  return { valid: true };
}
export function assertValid(code, name) {
  const r = validateProduct(code, name);
  if (!r.valid) throw new Error(r.reason);
}
export const MASTER_CATALOG = catalog;
