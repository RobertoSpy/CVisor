const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const { performTransaction, awardBadgePoints } = require("../../utils/pointsManager");
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

  try {
    await performTransaction(async (client) => {
      // 1. Check if exists
      const { rowCount } = await client.query(
        "SELECT 1 FROM user_badges WHERE user_id=$1 AND badge_code=$2",
        [uid, badge_code]
      );
      if (rowCount > 0) throw new Error("Badge already unlocked");

      // 2. Insert Badge
      await client.query(
        "INSERT INTO user_badges (user_id, badge_code, unlocked_at) VALUES ($1, $2, NOW())",
        [uid, badge_code]
      );

      // 3. Award Bonus Points (Atomic via same client)
      await awardBadgePoints(uid, badge_code, client);
    });

    res.json({ ok: true });
  } catch (err) {
    if (err.message === "Badge already unlocked") {
      return res.status(400).json({ error: "Badge already unlocked" });
    }
    console.error("[badges/unlock] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;