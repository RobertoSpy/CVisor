const express = require('express');
const router = express.Router();
const { pool } = require('../../db');
const bcrypt = require('bcrypt');
const verifyToken = require('../../middleware/verifyToken');
const verifyAdmin = require('../../middleware/verifyAdmin');
const { sendWarningEmail } = require('../../utils/sendWarningEmail');
const studentService = require('../../services/StudentService');

router.use(verifyToken);
router.use(verifyAdmin);

// 1. Obține toți utilizatorii (cu opțiune de filtrare după rol)
router.get('/', async (req, res) => {
  const { role } = req.query;
  try {
    let query = `
      SELECT id, full_name, email, role, is_verified, created_at 
      FROM users 
    `;
    const params = [];

    if (role && ['student', 'organization', 'admin'].includes(role)) {
      query += `WHERE role = $1 `;
      params.push(role);
    }

    query += `ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("[Admin Users] Get error:", err.message);
    res.status(500).json({ message: "Eroare la preluarea utilizatorilor." });
  }
});

// 2. Trimite Avertisment Email
router.post('/:id/warn', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ message: "Motivul trebuie să conțină măcar 5 caractere." });
  }

  try {
    const userRes = await pool.query("SELECT email, full_name, role FROM users WHERE id = $1", [id]);
    if (userRes.rowCount === 0) return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });

    const user = userRes.rows[0];

    // Adminul nu își poate trimite sieși avertisment oficial prin platformă
    if (user.role === 'admin') {
      return res.status(400).json({ message: "Nu poți avertiza alt administrator." });
    }

    await sendWarningEmail(user.email, user.full_name, reason);

    res.json({ message: "Avertisment trimis cu succes!" });
  } catch (err) {
    console.error("[Admin Warn] Send error:", err.message);
    res.status(500).json({ message: "Eroare la trimiterea emailului." });
  }
});

// 3. Obține profilul detaliat complet al unui utilizator (pentru preview real)
router.get('/:id/profile', async (req, res) => {
  const { id } = req.params;
  try {
    const userRes = await pool.query(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = $1",
      [id]
    );
    if (userRes.rowCount === 0) return res.status(404).json({ message: "Utilizator inexistent." });

    const user = userRes.rows[0];

    if (user.role === 'student') {
      // Refolosim serviciul existent care returnează totul: profile, education, experience, media, points, badges
      const fullProfile = await studentService.getFullProfile(id);
      return res.json({ ...user, role: 'student', profileData: fullProfile });
    }

    if (user.role === 'organization') {
      // Profil organizație complet
      const { rows: profileRows } = await pool.query("SELECT * FROM organization_profiles WHERE user_id = $1", [id]);
      const orgProfile = profileRows[0] || {};

      // Oportunități
      const { rows: oppRows } = await pool.query(
        `SELECT * FROM opportunities WHERE user_id = $1 ORDER BY created_at DESC`,
        [id]
      );

      // Puncte
      let points = 0;
      const { rows: pointRows } = await pool.query("SELECT points FROM user_points WHERE user_id = $1", [id]);
      if (pointRows.length > 0) points = pointRows[0].points;

      // Badges
      const { rows: badgeRows } = await pool.query("SELECT badge_code FROM user_badges WHERE user_id = $1", [id]);
      const badges = badgeRows.map(r => r.badge_code);

      return res.json({
        ...user,
        role: 'organization',
        profileData: {
          ...orgProfile,
          opportunities: oppRows,
          points,
          badges
        }
      });
    }

    // Admin sau alt rol
    res.json({ ...user, profileData: {} });
  } catch (err) {
    console.error("[Admin Profile] Error:", err.message);
    res.status(500).json({ message: "Eroare la preluarea profilului." });
  }
});

// 4. Șterge utilizator
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Evităm ca adminul să se șteargă singur din greșeală
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: "Nu te poți șterge pe tine însuți." });
    }

    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    res.json({ message: "Utilizator șters cu succes." });
  } catch (err) {
    console.error("[Admin Users] Delete error:", err.message);
    res.status(500).json({ message: "Eroare la ștergerea utilizatorului." });
  }
});

// 4. Creare cont Organizație din Dashboard
router.post('/organization', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Toate câmpurile sunt obligatorii." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Parola trebuie să aibă minim 6 caractere." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Acest email există deja." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password, role, is_verified, created_at)
       VALUES ($1, $2, $3, 'organization', true, NOW())
       RETURNING id, full_name, email, role, created_at`,
      [fullName, email, hashedPassword]
    );

    const userId = userRes.rows[0].id;
    const newUser = userRes.rows[0];

    // Profil gol necesar
    await client.query(
      `INSERT INTO organization_profiles (user_id, name, updated_at) VALUES ($1, $2, NOW())`,
      [userId, fullName]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Organizație creată cu succes.", user: newUser });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Admin Users] Create Org error:", err.message);
    res.status(500).json({ message: "Eroare la crearea contului." });
  } finally {
    client.release();
  }
});

// 6. Obține o oportunitate detaliată
router.get('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const oppRes = await pool.query(`
      SELECT o.*, u.full_name as org_name, u.email as org_email
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);
    if (oppRes.rowCount === 0) return res.status(404).json({ message: "Oportunitate negăsită." });

    res.json(oppRes.rows[0]);
  } catch (err) {
    console.error("[Admin Opp] Error:", err.message);
    res.status(500).json({ message: "Eroare la preluare." });
  }
});

module.exports = router;
