const express = require("express");
const router = express.Router();
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");

router.post("/pageview", verifyToken, async (req, res) => {
  console.log(`[pageview]`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  try {
    const uid = Number(req.user?.id);
    if (!uid) return res.status(400).json({ error: "Missing user id" });

    // Inserează DOAR dacă userul există -> evită 500 pe FK când tokenul e vechi
    const result = await pool.query(`
  INSERT INTO app_events (user_id, event_type)
  SELECT $1, 'login'
  WHERE NOT EXISTS (
    SELECT 1 FROM app_events
    WHERE user_id = $1
      AND event_type = 'login'
      AND date(created_at) = CURRENT_DATE
  )
`, [uid]);
    console.log(`[pageview] DB result:`, result.rowCount);

    // ---------- 1. Puncte la primul login din zi ----------
    const { rowCount: alreadyGotPoints } = await pool.query(
      `SELECT 1 FROM user_point_events
      WHERE user_id = $1
        AND reason = 'login'
        AND date(created_at) = CURRENT_DATE`,
      [uid]
    );

    if (alreadyGotPoints === 0) {
      // 1a. Puncte base (5 pts)
      await pool.query(
        "INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, 5, NOW()) " +
        "ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + 5, updated_at = NOW()",
        [uid]
      );
      await pool.query(
        "INSERT INTO user_point_events (user_id, points_delta, reason) VALUES ($1, 5, 'login')",
        [uid]
      );

      // Notify Org about daily points
      const { notificationQueue } = require("../../lib/queue");
      notificationQueue.add("user-notification", {
        userId: uid,
        title: "Ai primit 5 puncte! 💎",
        body: "Bonus zilnic pentru autentificare.",
        icon: '/albastru.svg',
        url: '/organization'
      }, { removeOnComplete: true }).catch(console.error);

      // 1b. Calcul STREAK & BONUSURI
      try {
        // Calculăm streak-ul curent (zile consecutive până azi inclusiv)
        // Folosim o logică simplificată: numărăm zilele consecutive mergând înapoi
        const { rows: streakRows } = await pool.query(`
          WITH dates AS (
            SELECT DISTINCT date(created_at) as d
            FROM app_events
            WHERE user_id = $1 AND event_type = 'login'
          ),
          groups AS (
            SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d))::integer AS grp
            FROM dates
          )
          SELECT COUNT(*) as streak
          FROM groups
          WHERE grp = (SELECT grp FROM groups ORDER BY d DESC LIMIT 1)
        `, [uid]);

        const currentStreak = streakRows[0]?.streak ? parseInt(streakRows[0].streak) : 1;
        console.log(`[Org Stats] User ${uid} has streak: ${currentStreak}`);

        // Definim bonusurile (se repetă ciclic la fiecare 30 de zile)
        const MILESTONES = {
          3: 5,
          7: 5,
          14: 5,
          30: 5
        };

        // Calculăm ziua din ciclul curent (1-30)
        // Ex: ziua 33 devine 3; ziua 60 devine 30
        let cycleDay = currentStreak % 30;
        if (cycleDay === 0) cycleDay = 30;

        const bonus = MILESTONES[cycleDay];
        if (bonus) {
          console.log(`[Org Stats] Awarding streak bonus! Day ${currentStreak} -> +${bonus} pts`);

          await pool.query(
            "INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, $2, NOW()) " +
            "ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + $2, updated_at = NOW()",
            [uid, bonus]
          );
          await pool.query(
            "INSERT INTO user_point_events (user_id, points_delta, reason) VALUES ($1, $2, $3)",
            [uid, bonus, `streak_bonus_${currentStreak}d`]
          );
        }

      } catch (streakErr) {
        console.error("[Org Stats] Streak calc error:", streakErr);
      }
    }

    // ---------- 2. Bonus pentru badge nou deblocat azi ----------
    const { badge_code } = req.body; // badge_code ex: "streak_5"
    if (badge_code) {
      const { rowCount: badgeRow } = await pool.query(
        `SELECT 1 FROM user_badges WHERE user_id = $1 AND badge_code = $2 AND date(unlocked_at) = CURRENT_DATE`,
        [uid, badge_code]
      );
      const { rowCount: pointRow } = await pool.query(
        `SELECT 1 FROM user_point_events WHERE user_id = $1 AND reason = $2 AND date(created_at) = CURRENT_DATE`,
        [uid, `badge:${badge_code}`]
      );
      if (badgeRow > 0 && pointRow === 0) {
        await pool.query(
          "INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, 5, NOW()) " +
          "ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + 5, updated_at = NOW()",
          [uid]
        );
        await pool.query(
          "INSERT INTO user_point_events (user_id, points_delta, reason) VALUES ($1, 5, $2)",
          [uid, `badge:${badge_code}`]
        );
      }
    }

    res.json({ ok: true, points_awarded: alreadyGotPoints === 0 });
  } catch (e) {
    console.error("[pageview] error:", e.message, e.stack);
    res.status(500).json({ error: "DB error", details: e.message });
  }
});


router.get("/presence", verifyToken, async (req, res) => {
  const days = Math.max(1, parseInt(req.query.days ?? "35", 10));
  try {
    const uid = Number(req.user?.id);
    if (!uid) return res.status(400).json({ error: "Missing user id" });

    // Ia data creării contului
    const userResult = await pool.query(
      "SELECT created_at FROM users WHERE id = $1",
      [uid]
    );
    if (!userResult.rows.length) return res.status(404).json({ error: "User not found" });
    const createdAt = userResult.rows[0].created_at;
    // Calculează data de start: maxim între data de creare și (azi - days + 1)
    const queryStart = new Date(
      Math.max(
        new Date(createdAt).getTime(),
        new Date(new Date().setHours(0, 0, 0, 0) - (days - 1) * 24 * 60 * 60 * 1000).getTime()
      )
    );
    // În format YYYY-MM-DD
    const sqlStart = queryStart.toISOString().slice(0, 10);

    const sql = `
      WITH series AS (
        SELECT generate_series($1::date, current_date, interval '1 day')::date AS d
      ),
      counts AS (
        SELECT date(created_at) AS d, count(*) AS cnt
        FROM app_events
        WHERE user_id = $2
          AND event_type = 'login'
          AND created_at >= $1::date
        GROUP BY 1
      ),
      repairs AS (
        SELECT repaired_date AS d, 1 AS cnt
        FROM user_streak_repairs
        WHERE user_id = $2
          AND repaired_date >= $1::date
      )
      SELECT to_char(s.d, 'YYYY-MM-DD') AS day, 
             COALESCE(c.cnt, 0) + COALESCE(r.cnt, 0) AS count
      FROM series s
      LEFT JOIN counts c ON c.d = s.d
      LEFT JOIN repairs r ON r.d = s.d
      ORDER BY s.d;
    `;
    const { rows } = await pool.query(sql, [sqlStart, uid]);
    const map = {};
    rows.forEach(r => { map[r.day] = Number(r.count); });
    return res.json({ map, createdAt });
  } catch (e) {
    console.error("[presence] error:", e);
    return res.status(500).json({ error: "DB error", details: e.message });
  }
});



// — doar temporar, pentru debug —
router.get("/whoami", verifyToken, (req, res) => {
  console.log(`[whoami]`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  res.json({ user: req.user });
});
router.get("/diag", verifyToken, async (req, res) => {
  console.log(`[diag]`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id
  });
  const { rows } = await pool.query("SELECT NOW() AS now");
  console.log(`[diag] DB rows:`, rows.length);
  res.json({ ok: true, user: req.user, db_time: rows[0].now });
});

module.exports = router;
