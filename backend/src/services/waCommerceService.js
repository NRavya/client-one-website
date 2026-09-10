const db = require("../db/waDb");
const { sendTemplateMessage } = require("./waWhatsappService");

const ORDER_TEMPLATE_NAME = process.env.ORDER_TEMPLATE_NAME || "order_confirmation";
const ABANDONED_CART_TEMPLATE_NAME =
  process.env.ABANDONED_CART_TEMPLATE_NAME || "abandoned_cart_reminder";

/**
 * ---- ORDER DETAILS ----
 * Call this whenever an order is placed / status changes
 * (e.g. from your e-commerce webhook: Shopify, WooCommerce, custom checkout).
 */
async function notifyOrder({ orderId, phone, customerName, status, totalAmount, trackingUrl }) {
  db.prepare(
    `INSERT INTO orders (order_id, phone, customer_name, status, total_amount, tracking_url)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(orderId, phone, customerName, status, totalAmount, trackingUrl || null);

  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: customerName || "there" },
        { type: "text", text: orderId },
        { type: "text", text: status },
        { type: "text", text: String(totalAmount ?? "") },
      ],
    },
  ];

  const result = await sendTemplateMessage(phone, ORDER_TEMPLATE_NAME, "en_US", components);
  return result;
}

/**
 * ---- ABANDONED CART ----
 * Step 1: Log a cart as abandoned (call this when a user leaves checkout
 * without completing payment, e.g. after a period of inactivity).
 */
function logAbandonedCart({ phone, customerName, cartItems, cartValue, checkoutUrl }) {
  const info = db
    .prepare(
      `INSERT INTO abandoned_carts (phone, customer_name, cart_items, cart_value, checkout_url)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(phone, customerName, JSON.stringify(cartItems), cartValue, checkoutUrl);

  return info.lastInsertRowid;
}

/**
 * Step 2: Send reminder for a specific cart.
 * Template body example: "Hi {{1}}, you left {{2}} item(s) worth {{3}} in your cart. Complete your order:"
 * with a URL button linking to {{checkout_url}}.
 */
async function sendCartReminder(cartRow) {
  const items = JSON.parse(cartRow.cart_items || "[]");

  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: cartRow.customer_name || "there" },
        { type: "text", text: String(items.length) },
        { type: "text", text: String(cartRow.cart_value ?? "") },
      ],
    },
    {
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: cartRow.id.toString() }],
    },
  ];

  const result = await sendTemplateMessage(
    cartRow.phone,
    ABANDONED_CART_TEMPLATE_NAME,
    "en_US",
    components
  );

  if (result.success) {
    db.prepare(
      `UPDATE abandoned_carts SET status = 'reminded', reminded_at = strftime('%s','now') WHERE id = ?`
    ).run(cartRow.id);
  }

  return result;
}

/**
 * Cron-friendly: find carts abandoned for X+ minutes that haven't been reminded yet,
 * and send reminders. Call this on a schedule (see cron/waAbandonedCartCron.js).
 */
async function processAbandonedCarts(minutesThreshold = 30) {
  const cutoff = Math.floor(Date.now() / 1000) - minutesThreshold * 60;

  const carts = db
    .prepare(
      `SELECT * FROM abandoned_carts WHERE status = 'pending' AND created_at <= ?`
    )
    .all(cutoff);

  const results = [];
  for (const cart of carts) {
    const result = await sendCartReminder(cart);
    results.push({ cartId: cart.id, phone: cart.phone, ...result });
  }
  return results;
}

/** Mark a cart as recovered (call this when the customer completes checkout). */
function markCartRecovered(phone) {
  db.prepare(
    `UPDATE abandoned_carts SET status = 'recovered' WHERE phone = ? AND status = 'pending'`
  ).run(phone);
}

module.exports = {
  notifyOrder,
  logAbandonedCart,
  sendCartReminder,
  processAbandonedCarts,
  markCartRecovered,
};