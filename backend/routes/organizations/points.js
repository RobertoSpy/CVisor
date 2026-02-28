const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const { validate, pointsAddSchema } = require("../../middleware/validation");

const router = express.Router();

router.post("/points/add", verifyToken, validate(pointsAddSchema), async (req, res) => {
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
  res.json({ points: newPoints });
});

router.get("/points", verifyToken, async (req, res) => {
  const uid = req.user.id;
  const { rows } = await pool.query("SELECT points FROM user_points WHERE user_id=$1", [uid]);
  res.json({ points: rows[0]?.points ?? 0 });
});

module.exports = router;
