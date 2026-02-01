const express = require("express");
const { validate, userProfileSchema } = require("../../middleware/validation");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");

const router = express.Router();

// GET /api/users/me
router.get("/me", verifyToken, async (req, res) => {
  const uid = req.user.id;
  try {
    // Modificat: Join cu Users pentru a avea mereu un nume (fallback la full_name)
    const p = await pool.query(
      `SELECT COALESCE(p.name, u.full_name) as name,
              p.headline,
              p.bio,
              p.avatar_url AS "avatarUrl",
              p.skills,
              p.social,
              p.location,
              p.opportunity_refs
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id=$1`,
      [uid]
    );

    const prof = p.rows[0]; // Acum ar trebui să existe mereu pentru că user-ul există

    // Fallback de siguranță (deși LEFT JOIN pe user existent returnează row)
    if (!prof) {
      return res.status(404).json({ message: "User not found" });
    }

    const edu = await pool.query(
      `SELECT id, school, degree, start_ym AS start, end_ym AS "end", details
       FROM education WHERE user_id=$1
       ORDER BY start_ym DESC NULLS LAST, id DESC`,
      [uid]
    );
    const exp = await pool.query(
      `SELECT id, role, company, start_ym AS start, end_ym AS "end", details
       FROM experience WHERE user_id=$1
       ORDER BY start_ym DESC NULLS LAST, id DESC`,
      [uid]
    );

    // MEDIA
    const media = await pool.query(
      `SELECT id, kind, url, caption
       FROM portfolio_media WHERE user_id=$1
       ORDER BY id ASC`,
      [uid]
    );

    res.json({
      ...prof,
      avatarDataUrl: prof.avatarUrl || "",
      skills: prof.skills || [],
      location: prof.location || "",
      opportunityRefs: prof.opportunity_refs || [],
      education: edu.rows,
      experience: exp.rows,
      portfolioMedia: media.rows
    });
  } catch (e) {
    console.error("[GET /me] Error:", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// PUT /api/users/me
router.put("/me", verifyToken, validate(userProfileSchema), async (req, res) => {
  const uid = req.user.id;
  const body = req.body || {};
  const {
    name, headline, bio,
    avatarUrl, avatarDataUrl,
    skills = [], social = {},
    education = [], experience = [],
    portfolioMedia = [],
    location = "",
    opportunityRefs = []
  } = body;

  const avatar = avatarUrl || avatarDataUrl || null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO profiles (user_id, name, headline, bio, avatar_url, skills, social, location, opportunity_refs, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         name = EXCLUDED.name,
         headline = EXCLUDED.headline,
         bio = EXCLUDED.bio,
         avatar_url = EXCLUDED.avatar_url,
         skills = EXCLUDED.skills,
         social = EXCLUDED.social,
         location = EXCLUDED.location,
         opportunity_refs = EXCLUDED.opportunity_refs,
         updated_at = NOW()`,
      [
        uid,
        name || null,
        headline || null,
        bio || null,
        avatar,
        skills, // Pass array directly for TEXT[]
        JSON.stringify(social),
        location || null,
        JSON.stringify(opportunityRefs)
      ]
    );

    await client.query("DELETE FROM education WHERE user_id=$1", [uid]);
    for (const e of education) {
      await client.query(
        `INSERT INTO education (user_id, school, degree, start_ym, end_ym, details)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uid, e.school || "", e.degree || "", e.start || null, e.end || null, e.details || null]
      );
    }

    await client.query("DELETE FROM experience WHERE user_id=$1", [uid]);
    for (const e of experience) {
      await client.query(
        `INSERT INTO experience (user_id, role, company, start_ym, end_ym, details)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uid, e.role || "", e.company || "", e.start || null, e.end || null, e.details || null]
      );
    }

    // PORTFOLIO MEDIA
    await client.query("DELETE FROM portfolio_media WHERE user_id=$1", [uid]);
    for (const m of portfolioMedia) {
      await client.query(
        `INSERT INTO portfolio_media (user_id, kind, url, caption)
         VALUES ($1, $2, $3, $4)`,
        [uid, m.kind, m.url, m.caption || null]
      );
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    console.error("[PUT /me] Error:", e);
    await client.query("ROLLBACK");
    res.status(500).json({ message: "DB error", error: e.message });
  } finally {
    client.release();
  }
});

router.get("/all", verifyToken, async (req, res) => {
  try {
    // Poți filtra doar userii cu rol student (dacă vrei)
    const usersResult = await pool.query(
      `SELECT u.id, u.full_name AS name, p.avatar_url AS "avatarUrl", p.headline, p.bio
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.role = 'student'`
    );
    res.json({ students: usersResult.rows });
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// GET /api/users/basic
router.get("/basic", verifyToken, async (req, res) => {
  const uid = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, email, role, full_name
       FROM users
       WHERE id=$1`, [uid]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// GET /api/users/:id
router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  try {
    // Ia profilul
    const p = await pool.query(
      `SELECT u.id, u.full_name AS name,
              p.headline,
              p.bio,
              p.avatar_url AS "avatarUrl",
              p.skills,
              p.social,
              p.location,
              opportunity_refs
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );
    const prof = p.rows[0];
    if (!prof) return res.status(404).json({ message: "User not found" });

    // Ia educația
    const edu = await pool.query(
      `SELECT id, school, degree, start_ym AS start, end_ym AS "end", details
       FROM education WHERE user_id=$1
       ORDER BY start_ym DESC NULLS LAST, id DESC`,
      [userId]
    );
    // Ia experiența
    const exp = await pool.query(
      `SELECT id, role, company, start_ym AS start, end_ym AS "end", details
       FROM experience WHERE user_id=$1
       ORDER BY start_ym DESC NULLS LAST, id DESC`,
      [userId]
    );
    // Ia media
    const media = await pool.query(
      `SELECT id, kind, url, caption
       FROM portfolio_media WHERE user_id=$1
       ORDER BY id ASC`,
      [userId]
    );

    // [NEW] Ia puncte
    const pointsRes = await pool.query("SELECT points FROM user_points WHERE user_id=$1", [userId]);
    const points = pointsRes.rows[0]?.points || 0;

    // [NEW] Ia badges
    const badgesRes = await pool.query("SELECT badge_code FROM user_badges WHERE user_id=$1", [userId]);
    const badges = badgesRes.rows.map(r => r.badge_code);

    res.json({
      ...prof,
      skills: prof.skills || [],
      location: prof.location || "",
      opportunityRefs: prof.opportunity_refs || [],
      education: edu.rows,
      experience: exp.rows,
      portfolioMedia: media.rows,
      points, // Returnăm punctele
      badges  // Returnăm badge-urile
    });
  } catch (e) {
    res.status(500).json({ message: "DB error", error: e.message });
  }
});





module.exports = router;
