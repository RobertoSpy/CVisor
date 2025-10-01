const express = require("express");
const { pool } = require("../../db");

const router = express.Router();

// GET /api/opportunities?q=...
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, org_name AS "orgName", type, skills, deadline, banner_image
       FROM opportunities
       ORDER BY id DESC`
    );
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
      `SELECT id, title, type, skills, deadline,available_spots, price, banner_image, promo_video, gallery,
        participants, location, tags, agenda, faq, reviews, description, cta_url
       FROM opportunities WHERE id=$1`, [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;
