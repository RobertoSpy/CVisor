const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const verifyOrg = require("../../middleware/verifyOrg"); // middleware pentru rol organizație

const router = express.Router();

function toPgArray(arr) {
  if (Array.isArray(arr)) {
    return '{' + arr.map(e => `"${String(e).replace(/"/g, '\\"')}"`).join(',') + '}';
  }
  // dacă e null/undefined, returnăm null astfel încât să fie tratat corect de PG
  if (arr == null) return null;
  return String(arr);
}

function toJson(val) {
  if (val == null) return null;
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return val;
}

// Creează oportunitate (POST /api/organization/opportunities)
router.post("/", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const {
    title,
    type,
    skills,
    deadline,
    available_spots,
    price,
    banner_image,
    promo_video,
    gallery,
    participants,
    location,
    tags,
    agenda,
    faq,
    reviews,
    description,
    cta_url
  } = req.body;

  if (!title || !type || !deadline || !description) {
    return res.status(400).json({ message: "Lipsesc câmpuri obligatorii" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO opportunities 
        (title, type, skills, deadline, user_id, available_spots, price, banner_image, promo_video, gallery, participants, location, tags, agenda, faq, reviews, description, cta_url)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        title,
        type,
        toPgArray(skills),
        deadline,
        userId,
        available_spots,
        price,
        banner_image,
        promo_video,
        toPgArray(gallery),
        toJson(participants),
        location,
        toPgArray(tags),
        toJson(agenda),
        toJson(faq),
        toJson(reviews),
        description,
        cta_url
      ]
    );
    // Adaugă 5 puncte pentru crearea oportunității
    await pool.query(
      "INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, 5, NOW()) " +
      "ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + 5, updated_at = NOW()",
      [userId]
    );
    await pool.query(
      "INSERT INTO user_point_events (user_id, points_delta, reason) VALUES ($1, 5, 'create_opportunity')",
      [userId]
    );

    res.json({ ...rows[0], pointsAdded: 5, reason: "create_opportunity" });
  } catch (e) {
    console.error("DB error (create opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Editează oportunitate (PUT /api/organization/opportunities/:id)
router.put("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    title,
    type,
    skills,
    deadline,
    available_spots,
    price,
    banner_image,
    promo_video,
    gallery,
    participants,
    location,
    tags,
    agenda,
    faq,
    reviews,
    description
  } = req.body;

  if (!title || !type || !deadline || !description) {
    return res.status(400).json({ message: "Lipsesc câmpuri obligatorii" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE opportunities SET
        title=$1, type=$2, skills=$3, deadline=$4, available_spots=$5,
        price=$6, banner_image=$7, promo_video=$8, gallery=$9, participants=$10,
        location=$11, tags=$12, agenda=$13, faq=$14, reviews=$15, description=$16
       WHERE id=$17 AND user_id=$18
       RETURNING *`,
      [
        title,
        type,
        toPgArray(skills),
        deadline,
        available_spots,
        price,
        banner_image,
        promo_video,
        toPgArray(gallery),
        toJson(participants),
        location,
        toPgArray(tags),
        toJson(agenda),
        toJson(faq),
        toJson(reviews),
        description,
        id,
        userId
      ]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (update opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Șterge oportunitate (DELETE /api/organization/opportunities/:id)
router.delete("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // folosim RETURNING * ca să putem returna rândul șters dacă e nevoie
    const { rows } = await pool.query(
      `DELETE FROM opportunities WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (delete opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi detalii oportunitate explorată (GET /api/organization/opportunities/explore/:id)
router.get("/explore/:id", verifyToken, verifyOrg, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, u.full_name as organization_name 
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (get explore opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi oportunitățile altor organizații (GET /api/organization/opportunities/explore)
router.get("/explore", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(`
      SELECT o.*, u.full_name as organization_name 
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id != $1 
      ORDER BY o.id DESC
    `, [userId]);
    res.json(rows);
  } catch (e) {
    console.error("DB error (explore opportunities):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi toate oportunitățile tale (GET /api/organization/opportunities)
router.get("/", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(`
      SELECT * FROM opportunities WHERE user_id = $1 ORDER BY id DESC
    `, [userId]);
    res.json(rows);
  } catch (e) {
    console.error("DB error (list opportunities):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Toggle Pin Status (PATCH /api/organization/opportunities/:id/pin)
router.patch("/:id/pin", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { is_pinned } = req.body; // true/false

  try {
    // Optional: Check limit of 5 pinned items
    if (is_pinned) {
      const { rows: countRows } = await pool.query(
        `SELECT COUNT(*) FROM opportunities WHERE user_id = $1 AND is_pinned_on_profile = TRUE`,
        [userId]
      );
      if (parseInt(countRows[0].count) >= 5) {
        return res.status(400).json({ message: "Poți avea maxim 5 oportunități fixate." });
      }
    }

    const { rows } = await pool.query(
      `UPDATE opportunities 
       SET is_pinned_on_profile = $1 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [is_pinned, id, userId]
    );

    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (pin opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Public: Get opportunities for a specific organization (GET /api/organization/opportunities/public/:userId)
router.get("/public/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT * FROM opportunities 
      WHERE user_id = $1 
      ORDER BY is_pinned_on_profile DESC, created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (e) {
    console.error("DB error (get org opportunities):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

router.get("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM opportunities WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (get opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;