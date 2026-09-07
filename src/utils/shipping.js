// Single source of truth for delivery charges (frontend).
// Slabs apply to the cart/order SUBTOTAL before adding delivery:
//   ₹200–₹349 → ₹70 | ₹350–₹699 → ₹35 | ₹700+ → FREE (₹0)
// Below ₹200 returns null — no invented value; callers show the
// minimum-order notice instead (see CartContext.MIN_ORDER_VALUE).
export const FREE_DELIVERY_THRESHOLD = 700;

export function getDeliveryFee(subtotal) {
  const s = Number(subtotal);
  if (!Number.isFinite(s) || s < 200) return null;
  if (s >= 700) return 0;
  if (s >= 350) return 35;
  return 70;
}
