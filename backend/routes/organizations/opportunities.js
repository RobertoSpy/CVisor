const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const verifyOrg = require("../../middleware/verifyOrg"); // middleware pentru rol organizație

const router = express.Router();

function toPgArray(arr) {
  if (Array.isArray(arr)) {
    return '{' + arr.map(e => `"${e.replace(/"/g, '\\"')}"`).join(',') + '}';
  }
  return arr; 
}

function toJson(val) {
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
    description
  } = req.body;

  if (!title || !type || !deadline || !description) {
    return res.status(400).json({ message: "Lipsesc câmpuri obligatorii" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO opportunities 
        (title, type, skills, deadline, user_id, available_spots, price, banner_image, promo_video, gallery, participants, location, tags, agenda, faq, reviews, description)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        title, type, toPgArray(skills), deadline, userId,
        available_spots, price, banner_image, promo_video,
        toPgArray(gallery), toJson(participants), location, toPgArray(tags), toJson(agenda), toJson(faq), toJson(reviews), description
      ]
    );
    res.json(rows[0]);
  } catch (e) {
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
        title, type, toPgArray(skills), deadline, available_spots, price, banner_image, promo_video,
        toPgArray(gallery), toJson(participants), location, toPgArray(tags), toJson(agenda), toJson(faq), toJson(reviews), description, id, userId
      ]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});
// Șterge oportunitate (DELETE /api/organization/opportunities/:id)
router.delete("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM opportunities WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );
    if (!rowCount) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi toate oportunitățile tale (GET /api/organization/opportunities)
router.get("/", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(`
      SELECT * FROM opportunities WHERE user_id=$1 ORDER BY id DESC
    `, [userId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

router.get("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM opportunities WHERE id=$1 AND user_id=$2`,
      [req.params.id, userId]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;