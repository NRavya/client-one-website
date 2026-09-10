// WhatsApp automation — provider-agnostic, DISABLED BY DEFAULT.
// Uses the mandatory +91 customer phone for order notifications + abandoned carts.
//
// Enable only when a BSP is configured:
//   WHATSAPP_ENABLED=true
//   WHATSAPP_PROVIDER=<interakt|gupshup|twilio|meta> (no hardwired default)
//   WHATSAPP_API_KEY / WHATSAPP_API_URL / template IDs per event
//
// Rules enforced here (never in checkout):
// - Never throw into order creation / checkout. All failures are logged as
//   SKIPPED_* / FAILED and swallowed by callers (.catch(()=>{})).
// - Never send marketing/abandoned-cart without explicit opt-in
//   (Customer.whatsappMarketingOptIn). Order-communication messages use the
//   mandatory phone but still respect template requirements: without a
//   configured provider + template, we log SKIPPED_DISABLED and send nothing.
// - Idempotency: one WhatsappEvent row per (phone, event, orderNumber).
//   Duplicates are skipped even if updateOrderStatus is called twice.

const prisma = require('../config/prisma');
const { normalizeIndianPhone } = require('../utils/phone');

const ORDER_EVENTS = new Set([
  'order_confirmed',
  'order_packed',
  'order_shipped',
  'order_out_for_delivery',
  'order_delivered',
  'order_cancelled',
  'abandoned_cart',
]);

function isEnabled() {
  return String(process.env.WHATSAPP_ENABLED || '').toLowerCase() === 'true';
}

function getProvider() {
  return String(process.env.WHATSAPP_PROVIDER || '').toLowerCase() || null;
}

async function logEvent({ phone, event, orderNumber, status, detail }) {
  try {
    await prisma.whatsappEvent.create({
      data: { phone, event, orderNumber: orderNumber || null, status, detail: detail ? String(detail).slice(0, 1000) : null },
    });
  } catch (e) {
    // Logging must never break checkout — table may not exist pre-migration.
    console.warn('[whatsapp] log failed:', e.message);
  }
}

async function alreadySent({ phone, event, orderNumber }) {
  try {
    const existing = await prisma.whatsappEvent.findFirst({
      where: { phone, event, orderNumber: orderNumber || null, status: { in: ['SENT', 'QUEUED'] } },
    });
    return Boolean(existing);
  } catch {
    return false;
  }
}

// eslint-disable-next-line no-unused-vars
async function sendViaProvider({ provider, phone, event, order, templateParams }) {
  // No provider is hardwired. Wire your BSP here when decided and set
  // WHATSAPP_ENABLED=true + provider credentials. Until then every call
  // returns SKIPPED_DISABLED and nothing is sent.
  return { skipped: true, reason: `provider not configured (${provider || 'none'})` };
}

async function notifyOrderEvent({ event, order, phone }) {
  const normalized = normalizeIndianPhone(phone || order?.shippingPhone || order?.customer?.phone);
  const orderNumber = order?.orderNumber || order?.id || null;
  if (!ORDER_EVENTS.has(event)) return { skipped: true, reason: 'unknown event' };
  if (!normalized) {
    await logEvent({ phone: String(phone || ''), event, orderNumber, status: 'SKIPPED_NO_PHONE', detail: 'No valid +91 number' });
    return { skipped: true, reason: 'no phone' };
  }
  if (await alreadySent({ phone: normalized, event, orderNumber })) {
    return { skipped: true, reason: 'duplicate prevented' };
  }
  if (!isEnabled() || !getProvider()) {
    await logEvent({ phone: normalized, event, orderNumber, status: 'SKIPPED_DISABLED', detail: 'WhatsApp disabled or no provider configured' });
    return { skipped: true, reason: 'disabled' };
  }
  try {
    const templateParams = {
      name: order?.shippingName || order?.customer?.name || 'Customer',
      orderNumber,
      total: order?.total,
      status: order?.status,
    };
    const result = await sendViaProvider({ provider: getProvider(), phone: normalized, event, order, templateParams });
    if (result?.skipped) {
      await logEvent({ phone: normalized, event, orderNumber, status: 'SKIPPED_DISABLED', detail: result.reason });
      return result;
    }
    await logEvent({ phone: normalized, event, orderNumber, status: 'QUEUED', detail: getProvider() });
    return { queued: true };
  } catch (e) {
    await logEvent({ phone: normalized, event, orderNumber, status: 'FAILED', detail: e.message });
    return { skipped: true, reason: 'provider failure (checkout unaffected)' };
  }
}

// Abandoned cart: caller must pass only opted-in customers.
// Marketing consent is separate from the mandatory order-communication number.
async function notifyAbandonedCart({ phone, cartCount, customerId }) {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) return { skipped: true, reason: 'no phone' };
  if (await alreadySent({ phone: normalized, event: 'abandoned_cart', orderNumber: customerId || null })) {
    return { skipped: true, reason: 'duplicate prevented' };
  }
  if (!isEnabled() || !getProvider()) {
    await logEvent({ phone: normalized, event: 'abandoned_cart', orderNumber: customerId || null, status: 'SKIPPED_DISABLED', detail: 'disabled or no provider' });
    return { skipped: true, reason: 'disabled' };
  }
  try {
    let optedIn = false;
    if (customerId) {
      try {
        const c = await prisma.customer.findUnique({ where: { id: customerId } });
        optedIn = Boolean(c?.whatsappMarketingOptIn);
      } catch {}
    }
    if (!optedIn) {
      await logEvent({ phone: normalized, event: 'abandoned_cart', orderNumber: customerId || null, status: 'SKIPPED_NO_CONSENT', detail: 'Marketing opt-in required' });
      return { skipped: true, reason: 'no marketing consent' };
    }
    await sendViaProvider({ provider: getProvider(), phone: normalized, event: 'abandoned_cart', order: { cartCount }, templateParams: { cartCount } });
    await logEvent({ phone: normalized, event: 'abandoned_cart', orderNumber: customerId || null, status: 'QUEUED', detail: getProvider() });
    return { queued: true };
  } catch (e) {
    await logEvent({ phone: normalized, event: 'abandoned_cart', orderNumber: customerId || null, status: 'FAILED', detail: e.message });
    return { skipped: true, reason: 'provider failure' };
  }
}

module.exports = { notifyOrderEvent, notifyAbandonedCart, isEnabled, ORDER_EVENTS };
