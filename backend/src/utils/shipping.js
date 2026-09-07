// Single source of truth for delivery charges (backend, CommonJS).
// Slabs apply to the order SUBTOTAL before adding delivery:
//   ₹200–₹349 → ₹70 | ₹350–₹699 → ₹35 | ₹700+ → FREE (₹0)
// Below ₹200 returns null — createOrder rejects those with MINIMUM_ORDER
// before this is ever used, so no value is invented.
const FREE_DELIVERY_THRESHOLD = 700;

function getDeliveryFee(subtotal) {
  const s = Number(subtotal);
  if (!Number.isFinite(s) || s < 200) return null;
  if (s >= 700) return 0;
  if (s >= 350) return 35;
  return 70;
}

module.exports = { FREE_DELIVERY_THRESHOLD, getDeliveryFee };
