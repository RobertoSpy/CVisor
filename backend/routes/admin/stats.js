const express = require('express');
const router = express.Router();
const { pool } = require('../../db');
const verifyToken = require('../../middleware/verifyToken');
const verifyAdmin = require('../../middleware/verifyAdmin');

// Rutele sunt protejate de verifyToken + verifyAdmin
router.use(verifyToken);
router.use(verifyAdmin);

// Date pentru dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Total Utilizatori
    const totalUsers = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE role = 'student') as students,
        COUNT(*) FILTER (WHERE role = 'organization') as organizations
      FROM users
    `);

    // 2. Oportunități postate astăzi
    const oppsToday = await pool.query(`
      SELECT COUNT(*) as count 
      FROM opportunities 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // 3. Logări astăzi (pe baza refresh token-urilor generate)
    const loginsToday = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM refresh_tokens 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // 4. Ultimele 5 oportunități create
    const recentOpps = await pool.query(`
      SELECT o.id, o.title, o.type, o.created_at, u.full_name as org_name
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // 5. Ultimele 5 conturi create
    const recentUsers = await pool.query(`
      SELECT id, full_name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 6. Date pentru grafic (Ultimele 7 zile)
    const chartQuery = await pool.query(`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as d
      ),
      signups AS (
        SELECT DATE(created_at) as d,
               COUNT(*) FILTER (WHERE role = 'student') as student_signups,
               COUNT(*) FILTER (WHERE role = 'organization') as org_signups
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY d
      ),
      logins AS (
        SELECT DATE(rt.created_at) as d,
               COUNT(DISTINCT rt.user_id) FILTER (WHERE u.role = 'student') as student_logins,
               COUNT(DISTINCT rt.user_id) FILTER (WHERE u.role = 'organization') as org_logins
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY d
      ),
      opps AS (
        SELECT DATE(created_at) as d, COUNT(*) as opp_count
        FROM opportunities
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY d
      )
      SELECT 
        TO_CHAR(dates.d, 'YYYY-MM-DD') as date,
        COALESCE(s.student_signups, 0)::int as student_signups,
        COALESCE(s.org_signups, 0)::int as org_signups,
        COALESCE(l.student_logins, 0)::int as student_logins,
        COALESCE(l.org_logins, 0)::int as org_logins,
        COALESCE(o.opp_count, 0)::int as opp_count
      FROM dates
      LEFT JOIN signups s ON dates.d = s.d
      LEFT JOIN logins l ON dates.d = l.d
      LEFT JOIN opps o ON dates.d = o.d
      ORDER BY dates.d ASC;
    `);

    res.json({
      stats: {
        totalStudents: parseInt(totalUsers.rows[0].students) || 0,
        totalOrganizations: parseInt(totalUsers.rows[0].organizations) || 0,
        opportunitiesToday: parseInt(oppsToday.rows[0].count) || 0,
        loginsToday: parseInt(loginsToday.rows[0].count) || 0,
      },
      recentOpportunities: recentOpps.rows,
      recentUsers: recentUsers.rows,
      chartData: chartQuery.rows
    });
  } catch (err) {
    console.error("[Admin Stats] Error:", err.message);
    res.status(500).json({ message: "Eroare la obținerea datelor." });
  }
});

module.exports = router;
