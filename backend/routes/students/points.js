const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");

const router = express.Router();

router.post("/points/add", verifyToken, async (req, res) => {
  const { points_delta, reason } = req.body;
  const uid = req.user.id;
  // Fetch current
  const { rows } = await pool.query("SELECT points FROM user_points WHERE user_id=$1", [uid]);
  let current = rows[0]?.points ?? 0;
  let newPoints = Math.max(current + points_delta, 0);
  await pool.query(
    `INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, $2, NOW())
    ON CONFLICT (user_id) DO UPDATE SET points = $2, updated_at = NOW()`,
    [uid, newPoints]
  );
  await pool.query(
    "INSERT INTO user_point_events (user_id, points_delta, reason) VALUES ($1, $2, $3)",
    [uid, points_delta, reason]
  );

  // [NEW] Dacă e repair, salvează și în user_streak_repairs
  if (reason === "repair") {
    // Presupunem că repair-ul se face pentru ziua curentă sau o zi specifică.
    // Dar momentan frontend-ul trimite doar "repair". 
    // Ideal ar fi să trimită și data.
    // Dacă frontend-ul nu trimite data, nu putem salva exact ce zi s-a reparat.
    // Voi modifica să accepte și `repaired_date` în body.
    const { repaired_date } = req.body;
    if (repaired_date) {
      await pool.query(
        "INSERT INTO user_streak_repairs (user_id, repaired_date) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [uid, repaired_date]
      );
    }
  }
  res.json({ points: newPoints });
});

router.get("/points", verifyToken, async (req, res) => {
  const uid = req.user.id;
  const { rows } = await pool.query("SELECT points FROM user_points WHERE user_id=$1", [uid]);
  res.json({ points: rows[0]?.points ?? 0 });
});

module.exports = router;
