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


// GET /api/organization/profile
router.get("/profile", verifyToken, async (req, res) => {
  const uid = req.user.id;
  try {
    const { rows } = await pool.query("SELECT * FROM organization_profiles WHERE user_id = $1", [uid]);
    res.json(rows[0] ?? {});
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// POST /api/organization/profile
router.post("/profile", verifyToken, async (req, res) => {
  const uid = req.user.id;
  const {
    name, headline, bio, avatarUrl, bannerUrl, location, volunteers,
    social = [], events = [], keyPeople = [], contactPersons = [], media = [],
    history, videoUrl
  } = req.body;

  try {
    await pool.query(`
      INSERT INTO organization_profiles
        (user_id, name, headline, bio, avatar_url, banner_url, location, volunteers, social, events, key_people, contact_persons, media, history, video_url, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13, $14, $15, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        name = $2,
        headline = $3,
        bio = $4,
        avatar_url = $5,
        banner_url = $6,
        location = $7,
        volunteers = $8,
        social = $9::jsonb,
        events = $10::jsonb,
        key_people = $11::jsonb,
        contact_persons = $12::jsonb,
        media = $13::jsonb,
        history = $14,
        video_url = $15,
        updated_at = NOW()
    `, [
      uid, name, headline, bio, avatarUrl, bannerUrl, location, volunteers,
      JSON.stringify(social), JSON.stringify(events),
      JSON.stringify(keyPeople), JSON.stringify(contactPersons), JSON.stringify(media),
      history, videoUrl
    ]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

router.get("/all", verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
  `SELECT op.user_id AS id, op.name, op.headline, op.bio, op.avatar_url AS "avatarUrl"
   FROM organization_profiles op
   JOIN users u ON u.id = op.user_id
   WHERE u.role = 'organization'
   ORDER BY op.updated_at DESC`
);
res.json({ organizations: rows });
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await pool.query("SELECT * FROM organization_profiles WHERE user_id = $1", [id]);
    if (!rows[0]) return res.status(404).json({ message: "Organizație negăsită" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});


module.exports = router;