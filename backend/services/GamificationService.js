const BaseService = require("./BaseService");
const { pool } = require("../db");
const pointsManager = require("../utils/pointsManager");
const { notificationQueue } = require("../queues");

class GamificationService extends BaseService {
  constructor() {
    super(null);
  }

  /**
   * Records a daily login event and awards points/streaks if applicable.
   * @param {number} userId
   * @param {string} userType - 'student' or 'organization' (for notification URL)
   */
  async recordDailyLogin(userId, userType = 'student') {
    return pointsManager.performTransaction(async (client) => {
      // 1. Log the login event
      // Avoid duplicate 'login' events for the same day to prevent spamming the stats
      await client.query(`
        INSERT INTO app_events (user_id, event_type)
        SELECT $1, 'login'
        WHERE NOT EXISTS (
          SELECT 1 FROM app_events
          WHERE user_id = $1
            AND event_type = 'login'
            AND date(created_at) = CURRENT_DATE
        )
      `, [userId]);

      // 2. Check if daily points already awarded
      const { rowCount: alreadyGotPoints } = await client.query(
        `SELECT 1 FROM user_point_events
         WHERE user_id = $1
           AND reason = 'login'
           AND date(created_at) = CURRENT_DATE`,
        [userId]
      );

      if (alreadyGotPoints > 0) {
        return { points_awarded: false };
      }

      // 3. Award Daily Points (5 pts)
      await pointsManager.addPoints(userId, 5, 'login', client);

      // 4. Calculate and Award Streak Bonus
      const streakBonus = await this._calculateAndAwardStreak(userId, client);

      // 5. Send Notification (Side effect, non-blocking)
      const redirectUrl = userType === 'organization' ? '/organization' : '/student';
      notificationQueue.add("user-notification", {
        userId,
        title: "Ai primit 5 puncte! 💎",
        body: streakBonus
          ? `Bonus zilnic + ${streakBonus} puncte pentru streak!`
          : "Bonus zilnic pentru autentificare.",
        icon: '/albastru.svg',
        url: redirectUrl
      }, { removeOnComplete: true }).catch(console.error);

      return { points_awarded: true, streak_bonus: streakBonus };
    });
  }

  /**
   * Internal method to calculate streak and award bonus
   */
  async _calculateAndAwardStreak(userId, client) {
    try {
      // Calculate current streak
      const { rows: streakRows } = await client.query(`
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
      `, [userId]);

      const currentStreak = streakRows[0]?.streak ? parseInt(streakRows[0].streak) : 1;

      // Streak Milestone Bonuses — one-time at these exact days
      const MILESTONES = {
        3: 10,     // 3 days → +10 points
        7: 15,     // 7 days → +15 points
        14: 20,    // 14 days → +20 points
        30: 30,    // 30 days → +30 points
        60: 40,    // 60 days → +40 points
        90: 50,    // 90 days → +50 points
      };

      const bonus = MILESTONES[currentStreak];
      if (bonus) {
        // Check if already awarded for this milestone (avoid duplicate on refresh)
        const reason = `streak_bonus_${currentStreak}d`;
        const { rowCount } = await client.query(
          `SELECT 1 FROM user_point_events WHERE user_id = $1 AND reason = $2`,
          [userId, reason]
        );
        if (rowCount === 0) {
          await pointsManager.addPoints(userId, bonus, reason, client);
          return bonus;
        }
      }
      return 0;

    } catch (err) {
      console.error("[GamificationService] Streak calc error:", err);
      return 0;
    }
  }

  /**
   * Awards points for a newly unlocked badge if not already awarded.
   * @param {number} userId 
   * @param {string} badgeCode 
   */
  async awardBadgePoints(userId, badgeCode) {
    return pointsManager.performTransaction(async (client) => {
      // Check if badge unlocked today
      const { rowCount: badgeRow } = await client.query(
        `SELECT 1 FROM user_badges WHERE user_id = $1 AND badge_code = $2 AND date(unlocked_at) = CURRENT_DATE`,
        [userId, badgeCode]
      );

      if (badgeRow === 0) return { points_awarded: false, reason: 'badge_not_found_or_old' };

      // Check if points already awarded for this badge
      const reason = `badge:${badgeCode}`;
      const { rowCount: pointRow } = await client.query(
        `SELECT 1 FROM user_point_events WHERE user_id = $1 AND reason = $2`,
        [userId, reason]
      );

      if (pointRow > 0) return { points_awarded: false, reason: 'already_awarded' };

      // Award Points (5 pts)
      await pointsManager.addPoints(userId, 5, reason, client);
      return { points_awarded: true };
    });
  }

  /**
   * Retrieves presence data for the analytics chart.
   */
  /**
   * Retrieves presence/activity data for the analytics chart.
   * Uses pool directly (not inside a transaction — read-only query).
   */
  async getPresenceData(userId, days = 35) {
    const userResult = await pool.query(
      "SELECT created_at FROM users WHERE id = $1",
      [userId]
    );
    if (!userResult.rows.length) throw new Error("User not found");
    const createdAt = userResult.rows[0].created_at;

    const queryStart = new Date(
      Math.max(
        new Date(createdAt).getTime(),
        new Date(new Date().setHours(0, 0, 0, 0) - (days - 1) * 24 * 60 * 60 * 1000).getTime()
      )
    );
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

    const { rows } = await pool.query(sql, [sqlStart, userId]);
    const map = {};
    rows.forEach(row => { map[row.day] = Number(row.count); });

    return { map, createdAt };
  }
}

module.exports = new GamificationService();
