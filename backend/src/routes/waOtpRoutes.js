const express = require("express");
const router = express.Router();
const { requestOtp, verifyOtp } = require("../services/waOtpService");

// POST /api/otp/request { phone: "+919876543210" }
router.post("/request", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: "phone is required" });

  const result = await requestOtp(phone);
  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);
});

// POST /api/otp/verify { phone: "+919876543210", otp: "123456" }
router.post("/verify", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: "phone and otp are required" });
  }

  const result = verifyOtp(phone, otp);
  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);

  // On success, this is where you'd issue a session/JWT for login:
  // if (result.success) { const token = issueJwt(phone); ... }
});

module.exports = router;