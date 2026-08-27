const express = require('express');
const { handleCashfreeWebhook } = require('../webhooks/cashfreeWebhook');

const router = express.Router();

// Route specifically for raw body parsing
router.post('/cashfree', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Store raw body for signature verification
  req.rawBody = req.body;
  // Parse body as JSON for easy access
  try {
    req.body = JSON.parse(req.body.toString('utf8'));
  } catch (e) {
    req.body = {};
  }
  next();
}, handleCashfreeWebhook);

module.exports = router;
