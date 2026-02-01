const express = require("express");
const { pool } = require("../../db");
const crypto = require("crypto");
const router = express.Router();

/**
 * Handle Unsubscribe Request
 * Verifies email and token (security hash)
 */
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Verify Token (HMAC SHA256 of email + SECRET)
    // We use JWT_SECRET or a specific NEWSLETTER_SECRET
    const secret = process.env.JWT_SECRET || "default_secret";
    const expectedToken = crypto.createHmac("sha256", secret).update(email).digest("hex");

    if (token !== expectedToken) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // 2. Update User
    await pool.query(
      "UPDATE users SET newsletter_opt_in = FALSE WHERE email = $1",
      [email]
    );

    res.json({ ok: true, message: "Te-ai dezabonat cu succes." });
  } catch (error) {
    console.error("[Unsubscribe] Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
