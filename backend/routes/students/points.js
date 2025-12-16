const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const { processStreakRepair, getUserPoints } = require("../../utils/pointsManager");

const router = express.Router();

/**
 * Endpoint pentru streak repair (SINGURA operație permisă clientului)
 * SECURIZAT: Accept doar repair-uri valide, nu permit manipulare arbitrară a punctelor
 */
router.post("/points/add", verifyToken, async (req, res) => {
  try {
    const { points_delta, reason, repaired_date } = req.body;
    const uid = req.user.id;

    // SECURITATE: Accept DOAR streak repair cu validare strictă
    if (reason !== "repair") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Punctele pot fi modificate doar prin acțiuni validate de sistem."
      });
    }

    // Validare: repair trebuie să fie exact -20 puncte
    if (points_delta !== -20) {
      return res.status(400).json({
        error: "Invalid repair cost",
        message: "Costul unui repair este fix 20 puncte."
      });
    }

    // Validare: repaired_date obligatoriu
    if (!repaired_date) {
      return res.status(400).json({
        error: "Missing repaired_date",
        message: "Data reparată este obligatorie."
      });
    }

    // Procesare repair prin sistemul securizat
    const result = await processStreakRepair(uid, repaired_date);

    res.json({ points: result.newPoints, repaired_date: result.repairedDate });
  } catch (error) {
    console.error("[points/add] Error:", error);

    if (error.message === 'Insufficient points for repair') {
      return res.status(400).json({
        error: "Insufficient points",
        message: "Nu ai suficiente puncte pentru repair."
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
