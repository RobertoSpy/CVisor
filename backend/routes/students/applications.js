const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const { validate, applicationSchema } = require("../../middleware/validation");

const router = express.Router();

// GET /api/applications?me=1
router.get("/", verifyToken, async (req, res) => {
  if (!req.query.me) return res.json([]);
  try {
    const { rows } = await pool.query(
      `SELECT id,
              opportunity_title AS "opportunityTitle",
              org_name        AS "orgName",
              status, created_at
       FROM applications
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// POST /api/applications { opportunityId }
router.post("/", verifyToken, validate(applicationSchema), async (req, res) => {
  const { opportunityId } = req.body;
  if (!opportunityId) return res.status(400).json({ message: "opportunityId required" });

  try {
    const o = await pool.query(
      `SELECT id, title, org_name FROM opportunities WHERE id=$1`,
      [opportunityId]
    );
    if (!o.rowCount) return res.status(404).json({ message: "Opportunity not found" });

    const ins = await pool.query(
      `INSERT INTO applications (user_id, opportunity_id, opportunity_title, org_name, status)
       VALUES ($1,$2,$3,$4,'pending')
       RETURNING id, opportunity_title AS "opportunityTitle", org_name AS "orgName", status, created_at`,
      [req.user.id, opportunityId, o.rows[0].title, o.rows[0].org_name]
    );
    res.json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;
