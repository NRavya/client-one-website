const crypto = require("crypto");
const db = require("../db/waDb");
const { sendTemplateMessage } = require("./waWhatsappService");

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || "6", 10);
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);
const OTP_TEMPLATE_NAME = process.env.OTP_TEMPLATE_NAME || "otp_login";
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOtp() {
  const max = 10 ** OTP_LENGTH;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(OTP_LENGTH, "0");
}

function hashOtp(otp, phone) {
  return crypto.createHash("sha256").update(`${otp}:${phone}`).digest("hex");
}

/**
 * Request an OTP for a phone number: generates, stores hashed, sends via WhatsApp template.
 * The WhatsApp template must be an approved "Authentication" category template
 * with a single {{1}} body variable for the code, and a copy-code button.
 */
async function requestOtp(phone) {
  const recent = db
    .prepare(
      `SELECT * FROM otps WHERE phone = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(phone);

  const nowSec = Math.floor(Date.now() / 1000);
  if (recent && nowSec - recent.created_at < RESEND_COOLDOWN_SECONDS) {
    const waitFor = RESEND_COOLDOWN_SECONDS - (nowSec - recent.created_at);
    return { success: false, error: `Please wait ${waitFor}s before requesting another OTP.` };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp, phone);
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  db.prepare(
    `INSERT INTO otps (phone, otp_hash, expires_at) VALUES (?, ?, ?)`
  ).run(phone, otpHash, expiresAt);

  const components = [
    {
      type: "body",
      parameters: [{ type: "text", text: otp }],
    },
    {
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: otp }],
    },
  ];

  const result = await sendTemplateMessage(phone, OTP_TEMPLATE_NAME, "en", components);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, message: "OTP sent", expiresInMinutes: OTP_EXPIRY_MINUTES };
}

/**
 * Verify an OTP submitted by the user.
 */
function verifyOtp(phone, otp) {
  const record = db
    .prepare(
      `SELECT * FROM otps WHERE phone = ? AND verified = 0 ORDER BY created_at DESC LIMIT 1`
    )
    .get(phone);

  if (!record) {
    return { success: false, error: "No OTP request found. Please request a new OTP." };
  }

  if (Date.now() > record.expires_at) {
    return { success: false, error: "OTP expired. Please request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: "Too many attempts. Please request a new OTP." };
  }

  const hash = hashOtp(otp, phone);

  if (hash !== record.otp_hash) {
    db.prepare(`UPDATE otps SET attempts = attempts + 1 WHERE id = ?`).run(record.id);
    return { success: false, error: "Incorrect OTP." };
  }

  db.prepare(`UPDATE otps SET verified = 1 WHERE id = ?`).run(record.id);
  return { success: true, message: "OTP verified successfully." };
}

module.exports = { requestOtp, verifyOtp, generateOtp };