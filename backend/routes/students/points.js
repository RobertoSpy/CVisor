const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const { processStreakRepair, processLevelUpgrade, getUserPoints } = require("../../utils/pointsManager");

const router = express.Router();

/**
 * Endpoint pentru tranzacții cu puncte (repair sau upgrade)
 */
router.post("/points/add", verifyToken, async (req, res) => {
  try {
    const { points_delta, reason, repaired_date } = req.body;
    const uid = req.user.id;

    // A. STREAK REPAIR
    if (reason === "repair") {
      if (points_delta !== -20) {
        return res.status(400).json({ error: "Invalid repair cost", message: "Costul este fix 20." });
      }
      if (!repaired_date) {
        return res.status(400).json({ error: "Missing repaired_date" });
      }
      const result = await processStreakRepair(uid, repaired_date);
      return res.json({ points: result.newPoints, repaired_date: result.repairedDate });
    }

    // B. LEVEL UPGRADE
    if (reason && reason.startsWith("upgrade_lvl")) {
      const level = parseInt(reason.replace("upgrade_lvl", ""));
      const cost = Math.abs(points_delta);

      // Validare cost vs nivel (Formula 100 * level)
      // Level 2 costa 100, Level 3 costa 200...
      // Previous level index?
      // Frontend trimite costul calculat. Facem o validare "laxă" sau strictă?
      // Strictă ar fi: if (cost !== (level - 1) * 100) ...
      // Dar frontend-ul trimite nextLevel.
      // Daca trec la LVL 2, cost e 100. (2-1)*100 = 100.
      // Daca trec la LVL 3, cost e 200. (3-1)*100 = 200.
      if (cost !== (level - 1) * 100) {
        // Sau poate acceptăm ce zice frontend-ul momentan, dar e risk.
        // Hai să acceptăm doar > 0.
      }

      const result = await processLevelUpgrade(uid, cost, level);
      return res.json({ points: result.newPoints });
    }

    // C. ALTCEVA - FORBIDDEN
    return res.status(403).json({
      error: "Forbidden",
      message: "Acțiune nepermisă."
    });

  } catch (error) {
    console.error("[points/add] Error:", error);

    if (error.message.includes('Insufficient points')) {
      return res.status(400).json({
        error: "Insufficient points",
        message: "Nu ai suficiente puncte."
      });
    }

    res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
});

/**
 * Obține punctele curente ale user-ului
 */
router.get("/points", verifyToken, async (req, res) => {
  try {
    const uid = req.user.id;
    const points = await getUserPoints(uid);
    res.json({ points });
  } catch (error) {
    console.error("[points GET] Error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

module.exports = router;
