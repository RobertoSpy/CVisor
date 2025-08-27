const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const verifyOrg = require("../../middleware/verifyOrg"); // middleware pentru rol organizație

const router = express.Router();

// Creează oportunitate (POST /api/organization/opportunities)
router.post("/", verifyToken, verifyOrg, async (req, res) => {
  // Extragi doar ce ai nevoie din body
  const { title, type, skills, deadline } = req.body;

  // Id-ul organizației (user) din JWT
  const userId = req.user.id;

  // Validare câmpuri
  if (!title || !type || !deadline) {
    return res.status(400).json({ message: "Lipsesc câmpuri obligatorii" });
  }

  try {
    // Execută query și extrage rows corect!
    const { rows } = await pool.query(
      `INSERT INTO opportunities (title, type, skills, deadline, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, type, skills, deadline, userId]
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
  const { title, type, skills, deadline } = req.body;

  if (!title || !type || !deadline) {
    return res.status(400).json({ message: "Lipsesc câmpuri obligatorii" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE opportunities
       SET title=$1, type=$2, skills=$3, deadline=$4
       WHERE id=$5 AND user_id=$6
       RETURNING id, title, type, skills, deadline, user_id`,
      [title, type, skills, deadline, id, userId]
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
  const userId = req.user.id; // id-ul organizației (user)
  try {
    const { rows } = await pool.query(`
      SELECT id, title, type, skills, deadline
      FROM opportunities WHERE user_id=$1 ORDER BY id DESC
    `, [userId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi o oportunitate (GET /api/organization/opportunities/:id)
router.get("/:id", verifyToken, verifyOrg, async (req, res) => {
  const orgName = req.user.name;
  try {
    const { rows } = await pool.query(
      `SELECT id, title, type, skills, deadline FROM opportunities WHERE id=$1 AND org_name=$2`, 
      [req.params.id, orgName]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;