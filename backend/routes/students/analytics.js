const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");

// POST /api/students/analytics/pageview
router.post("/pageview", verifyToken, async (req, res) => {
  console.log(`[pageview]`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  try {
    const uid = Number(req.user?.id);
    if (!uid) return res.status(400).json({ error: "Missing user id" });

    // Inserează DOAR dacă userul există -> evită 500 pe FK când tokenul e vechi
    const result = await pool.query(
      "INSERT INTO app_events (user_id, event_type) " +
      "SELECT $1, 'pageview' WHERE EXISTS (SELECT 1 FROM users WHERE id=$1)",
      [uid]
    );
    console.log(`[pageview] DB result:`, result.rowCount);
    res.json({ ok: true });
  } catch (e) {
    console.error("[pageview] error:", e.message, e.stack);
    res.status(500).json({ error: "DB error", details: e.message });
  }
});

// GET /api/students/analytics/presence?days=35
router.get("/presence", verifyToken, async (req, res) => {
  console.log(`[presence]`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  const days = Math.max(1, parseInt(req.query.days ?? "35", 10));
  try {
    const uid = Number(req.user?.id);
    if (!uid) return res.status(400).json({ error: "Missing user id" });

    const sql = `
      WITH series AS (
        SELECT generate_series((current_date - ($1::int - 1)), current_date, interval '1 day')::date AS d
      ),
      counts AS (
        SELECT date(created_at) AS d, count(*) AS cnt
        FROM app_events
        WHERE user_id = $2
          AND event_type IN ('login','pageview')
          AND created_at >= (current_date - ($1::int - 1))::date
        GROUP BY 1
      )
      SELECT to_char(s.d, 'YYYY-MM-DD') AS day, COALESCE(c.cnt, 0) AS count
      FROM series s
      LEFT JOIN counts c ON c.d = s.d
      ORDER BY s.d;
    `;
    const { rows } = await pool.query(sql, [days, uid]);
    console.log(`[presence] DB rows:`, rows.length);
    const map = {};
    rows.forEach(r => { map[r.day] = Number(r.count); });
    res.json(map);
  } catch (e) {
    console.error("[presence] error:", e.message, e.stack);
    res.status(500).json({ error: "DB error", details: e.message });
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
