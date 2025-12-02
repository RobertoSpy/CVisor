const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");

// GET /api/organizations/analytics/posts?weeks=8
router.get("/posts", verifyToken, async (req, res) => {
  const weeks = Math.max(1, parseInt(req.query.weeks ?? "8", 10));
  try {
    const sql = `
      WITH buckets AS (
        SELECT gs AS offset,
               date_trunc('week', current_date) - (gs * interval '1 week') AS week_start
        FROM generate_series($1::int - 1, 0, -1) gs
      ),
      counts AS (
        SELECT date_trunc('week', created_at) AS week_start, COUNT(*) AS cnt
        FROM opportunities
        WHERE created_at >= (date_trunc('week', current_date) - (($1::int - 1) * interval '1 week'))
        GROUP BY 1
      )
      SELECT b.offset, COALESCE(c.cnt, 0) AS cnt
      FROM buckets b
      LEFT JOIN counts c ON c.week_start = b.week_start
      ORDER BY b.offset DESC;
    `;
    const { rows } = await pool.query(sql, [weeks]);
    res.json(rows.map(r => {
      let label = "";
      if (r.offset === 0) label = "Săpt. asta";
      else if (r.offset === 1) label = "1 săpt.";
      else if (r.offset === 4) label = "1 lună";
      else label = `${r.offset} săpt.`;

      return { label, value: Number(r.cnt) };
    }));
  } catch (e) {
    res.status(500).json({ error: "DB error", details: e.message });
  }
});

module.exports = router;
