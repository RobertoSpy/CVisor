const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const gamificationService = require("../../services/GamificationService");
const { validate, pageviewSchema } = require("../../middleware/validation");

router.post("/pageview", verifyToken, validate(pageviewSchema), async (req, res) => {
  try {
    const uid = Number(req.user?.id);
    if (!uid) return res.status(400).json({ error: "Missing user id" });

    // 1. Record Login & Daily Points
    const loginResult = await gamificationService.recordDailyLogin(uid, 'organization');

    // 2. Check for Badge Points
    const { badge_code } = req.body;
    if (badge_code) {
      await gamificationService.awardBadgePoints(uid, badge_code);
    }

    res.json({ ok: true, points_awarded: loginResult.points_awarded });
  } catch (e) {
    console.error("[org pageview] error:", e.message);
    res.status(500).json({ error: "Service error", details: e.message });
  }
});


router.get("/presence", verifyToken, async (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days ?? "35", 10)));
  try {
    const uid = Number(req.user?.id);
    if (!uid) return res.status(400).json({ error: "Missing user id" });

    const data = await gamificationService.getPresenceData(uid, days);
    res.json(data);
  } catch (e) {
    console.error("[org presence] error:", e);
    return res.status(500).json({ error: "Service error", details: e.message });
  }
});



// — doar temporar, pentru debug —
router.get("/whoami", verifyToken, (req, res) => {
  console.log(`[whoami]`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  res.json({ user: req.user });
});
router.get("/diag", verifyToken, async (req, res) => {
  console.log(`[diag]`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  const { rows } = await pool.query("SELECT NOW() AS now");
  console.log(`[diag] DB rows:`, rows.length);
  res.json({ ok: true, user: req.user, db_time: rows[0].now });
});

module.exports = router;
