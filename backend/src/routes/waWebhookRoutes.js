const express = require("express");
const router = express.Router();

// GET /webhook - Meta verification handshake (set this URL in Meta App Dashboard)
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// POST /webhook - receive delivery/read statuses and inbound messages
router.post("/", (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    body.entry?.forEach((entry) => {
      entry.changes?.forEach((change) => {
        const value = change.value;

        // Inbound messages from customers
        value.messages?.forEach((msg) => {
          console.log(`Inbound WhatsApp message from ${msg.from}:`, msg.text?.body || msg.type);
          // TODO: handle customer replies, e.g. "recovered cart" detection
        });

        // Delivery/read status updates for messages you sent
        value.statuses?.forEach((status) => {
          console.log(`Message ${status.id} status: ${status.status}`);
        });
      });
    });
  }

  res.sendStatus(200); // Always ack quickly
});

module.exports = router;