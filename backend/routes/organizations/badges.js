const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const { validate, badgeUnlockSchema } = require("../../middleware/validation");

const router = express.Router();

router.get("/badges", verifyToken, async (req, res) => {
  const uid = req.user.id;
  const { rows } = await pool.query("SELECT badge_code FROM user_badges WHERE user_id=$1", [uid]);
  res.json({ badges: rows.map(r => r.badge_code) });
});

router.post("/badges/unlock", verifyToken, validate(badgeUnlockSchema), async (req, res) => {
  const uid = req.user.id;
  const { badge_code } = req.body;
  // Verifică dacă există deja
  const { rowCount } = await pool.query(
    "SELECT 1 FROM user_badges WHERE user_id=$1 AND badge_code=$2",
    [uid, badge_code]
  );
  if (rowCount > 0) return res.status(400).json({ error: "Badge already unlocked" });
  await pool.query(
    "INSERT INTO user_badges (user_id, badge_code, unlocked_at) VALUES ($1, $2, NOW())",
    [uid, badge_code]
  );
  res.json({ ok: true });
});

module.exports = router;