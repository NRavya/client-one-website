const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { notifyAbandonedCart } = require('../services/whatsapp');
const prisma = require('../config/prisma');

const router = express.Router();

// Abandoned-cart reminder — authenticated customers only, marketing opt-in
// required inside the service. Disabled unless WHATSAPP_ENABLED + provider.
// Body: { phone, cartCount }
router.post('/abandoned-cart', protect, async (req, res) => {
  try {
    const { phone, cartCount } = req.body;
    const result = await notifyAbandonedCart({
      phone,
      cartCount: Number(cartCount) || 0,
      customerId: req.user.customerId,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    // Never break the storefront — automation failures are swallowed.
    res.json({ success: true, data: { skipped: true, reason: 'internal (storefront unaffected)' } });
  }
});

// Admin: inspect automation log (idempotency + debugging).
router.get('/events', protect, admin, async (req, res) => {
  try {
    const events = await prisma.whatsappEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: events });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

module.exports = router;
