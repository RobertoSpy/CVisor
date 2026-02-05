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
    let whereClauses = [];

    // Filter by period (today)
    if (req.query.period === 'today') {
      whereClauses.push(`o.created_at >= CURRENT_DATE`);
    }

    // Filter by search query (title, orgName, skills)
    const q = (req.query.q || "").toString().trim().toLowerCase();
    if (q) {
      // Add wildcard for ILIKE
      const searchParam = `%${q}%`;
      params.push(searchParam);

      // SQL Logic:
      // (title ILIKE $1 OR orgName ILIKE $1 OR skills::text ILIKE $1)
      // Note: We cast skills array to text for simple inclusion check
      whereClauses.push(`(
        o.title ILIKE $${params.length} OR 
        u.full_name ILIKE $${params.length} OR 
        array_to_string(o.skills, ',') ILIKE $${params.length}
      )`);
    }

    // Construct final Query
    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY o.id DESC`;

    const { rows } = await pool.query(query, params);

    // No more JS filtering needed!
    res.json(rows);
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
