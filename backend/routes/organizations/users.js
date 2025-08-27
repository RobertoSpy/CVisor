const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");

const router = express.Router();

// --- Get profil user/organizație (GET /api/users/me)
router.get("/me", verifyToken, async (req, res) => {
  const uid = req.user.id;
  try {
    const p = await pool.query(
      `SELECT name, headline, bio, avatar_url AS "avatarUrl", skills, social, role
       FROM profiles WHERE user_id=$1`,
      [uid]
    );
    const prof = p.rows[0] || {
      name: "", headline: "", bio: "",
      avatarUrl: "", skills: [], social: {}, role: "student"
    };
    // Adaugă statistici dacă e organizație (ex: nr. voluntari, proiecte, oportunități)
    let stats = {};
    if (prof.role === "organization") {
      const v = await pool.query(`SELECT COUNT(*) FROM volunteers WHERE org_id=$1`, [uid]);
      const pr = await pool.query(`SELECT COUNT(*) FROM projects WHERE org_id=$1`, [uid]);
      const op = await pool.query(`SELECT COUNT(*) FROM opportunities WHERE org_name=$1`, [prof.name]);
      stats = {
        voluntari: v.rows[0].count,
        proiecte: pr.rows[0].count,
        oportunitati: op.rows[0].count
      };
    }
    res.json({ ...prof, stats });
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});



module.exports = router;