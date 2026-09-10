const express = require("express");
const router = express.Router();
const {
  notifyOrder,
  logAbandonedCart,
  markCartRecovered,
  processAbandonedCarts,
} = require("../services/waCommerceService");

// POST /api/orders/notify
// Call this from your checkout/order system whenever an order is placed or its status changes.
router.post("/orders/notify", async (req, res) => {
  const { orderId, phone, customerName, status, totalAmount, trackingUrl } = req.body;
  if (!orderId || !phone || !status) {
    return res.status(400).json({ success: false, error: "orderId, phone, status are required" });
  }

  const result = await notifyOrder({ orderId, phone, customerName, status, totalAmount, trackingUrl });
  res.status(result.success ? 200 : 400).json(result);
});

// POST /api/cart/abandoned
// Call this when a user leaves checkout without paying (e.g. after 10-15 min inactivity on frontend).
router.post("/cart/abandoned", (req, res) => {
  const { phone, customerName, cartItems, cartValue, checkoutUrl } = req.body;
  if (!phone || !cartItems) {
    return res.status(400).json({ success: false, error: "phone and cartItems are required" });
  }

  const id = logAbandonedCart({ phone, customerName, cartItems, cartValue, checkoutUrl });
  res.json({ success: true, cartId: id });
});

// POST /api/cart/recovered
// Call this when the customer completes checkout, to stop reminders.
router.post("/cart/recovered", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: "phone is required" });

  markCartRecovered(phone);
  res.json({ success: true });
});

// POST /api/cart/process-reminders?minutes=30
// Manual trigger (also run automatically by cron, see cron/waAbandonedCartCron.js)
router.post("/cart/process-reminders", async (req, res) => {
  const minutes = parseInt(req.query.minutes || "30", 10);
  const results = await processAbandonedCarts(minutes);
  res.json({ success: true, processed: results.length, results });
});

module.exports = router;