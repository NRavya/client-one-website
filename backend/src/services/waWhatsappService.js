const axios = require("axios");

const BASE_URL = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || "v20.0"}`;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

const client = axios.create({
  baseURL: `${BASE_URL}/${PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

/**
 * Normalize phone number to WhatsApp format (no +, no spaces).
 * e.g. +91 98765 43210 -> 919876543210
 */
function normalizePhone(phone) {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Send a pre-approved WhatsApp template message.
 * Templates must be created & approved in Meta Business Manager first.
 *
 * @param {string} to - customer phone number
 * @param {string} templateName - approved template name
 * @param {string} languageCode - e.g. "en_US"
 * @param {Array} components - template variable components (header/body params)
 */
async function sendTemplateMessage(to, templateName, languageCode = "en_US", components = []) {
  const payload = {
    messaging_product: "whatsapp",
    to: normalizePhone(to),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  try {
    const { data } = await client.post("/messages", payload);
    return { success: true, data };
  } catch (err) {
    const errData = err.response?.data || err.message;
    console.error("WhatsApp send error:", JSON.stringify(errData, null, 2));
    return { success: false, error: errData };
  }
}

/**
 * Send a free-form text message.
 * NOTE: Only works within a 24-hour customer service window
 * (i.e. after the customer has messaged you recently). For anything
 * outside that window, you MUST use an approved template instead.
 */
async function sendTextMessage(to, body) {
  const payload = {
    messaging_product: "whatsapp",
    to: normalizePhone(to),
    type: "text",
    text: { body },
  };

  try {
    const { data } = await client.post("/messages", payload);
    return { success: true, data };
  } catch (err) {
    const errData = err.response?.data || err.message;
    console.error("WhatsApp send error:", JSON.stringify(errData, null, 2));
    return { success: false, error: errData };
  }
}

module.exports = {
  sendTemplateMessage,
  sendTextMessage,
  normalizePhone,
};