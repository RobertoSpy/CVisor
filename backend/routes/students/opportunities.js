const express = require("express");
const { pool } = require("../../db");

const router = express.Router();

// GET /api/opportunities?q=...
router.get("/", async (req, res) => {
  try {
    let query = `SELECT o.id, o.title, u.full_name AS "orgName", o.type, o.skills, o.deadline, o.banner_image, o.promo_video, o.created_at
       FROM opportunities o
       JOIN users u ON o.user_id = u.id`;
    const params = [];

    if (req.query.period === 'today') {
      query += ` WHERE o.created_at >= CURRENT_DATE`;
    }

    query += ` ORDER BY o.id DESC`;

    const { rows } = await pool.query(query, params);
    const q = (req.query.q || "").toString().toLowerCase();
    if (!q) return res.json(rows);

    const filtered = rows.filter(o =>
      (o.title + " " + o.orgName + " " + (o.skills || []).join(" "))
        .toLowerCase()
        .includes(q)
    );
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// GET /api/opportunities/:id (opțional, pentru pagina de detaliu)
router.get("/:id", async (req, res) => {
  try {
    const { rows, rowCount } = await pool.query(
      `SELECT id, title, type, skills, deadline,available_spots, price, banner_image, promo_video,
        participants, location, tags, agenda, faq, description, cta_url
       FROM opportunities WHERE id=$1`, [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;
