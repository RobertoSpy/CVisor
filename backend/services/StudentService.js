const BaseService = require("./BaseService");
const studentRepository = require("../repositories/StudentRepository");
const pointsManager = require("../utils/pointsManager");
const { pool } = require("../db");

class StudentService extends BaseService {
  constructor() {
    super(studentRepository);
  }

  async getFullProfile(userId) {
    const profile = await this.repository.getProfileWithUser(userId);
    if (!profile) {
      throw new Error("User not found");
    }

    const [edu, exp, media] = await Promise.all([
      this.repository.getEducation(userId),
      this.repository.getExperience(userId),
      this.repository.getPortfolioMedia(userId)
    ]);

    // Points and Badges (could stand to be in their own repositories, but simple queries are okay for now or use pointsManager helper if available)
    const points = await pointsManager.getUserPoints(userId);

    // Badges query
    const { rows: badgeRows } = await pool.query("SELECT badge_code FROM user_badges WHERE user_id=$1", [userId]);
    const badges = badgeRows.map(r => r.badge_code);

    return {
      ...profile,
      avatarDataUrl: profile.avatarUrl || "",
      avatarUrl: profile.avatarUrl || "", // Add alias for frontend compatibility
      skills: profile.skills || [],
      location: profile.location || "",
      opportunityRefs: profile.opportunity_refs || [],
      education: edu,
      experience: exp,
      portfolioMedia: media,
      points,
      badges
    };
  }

  async getAllUsers({ page = 1, limit = 12, minPoints = 0, minLevel = 0 } = {}) {
    const offset = (page - 1) * limit;

    // Construim clauza WHERE dinamic
    let whereClause = "WHERE u.role = 'student'";
    const values = [];
    let paramIndex = 1;

    // Filtrare Puncte
    if (minPoints > 0) {
      whereClause += ` AND COALESCE(points.total, 0) >= $${paramIndex++}`;
      values.push(minPoints);
    }

    // Filtrare Nivel (complexă, bazată pe badges)
    // Level 1 = 0 badges req (default)
    // Level 2 = badge 'lvl2' or streak >= 7
    // Level 3 = badge 'lvl3' or streak >= 30
    // etc.
    // Simplificare: Dacă minLevel > 1, cerem să aibă badge-ul corespunzător sau streak echivalent.
    // Pentru SQL curat, vom filtra doar dacă există badge-ul explicit 'lvlX' momentan, sau ne bazăm pe puncte care corelează.
    // *Implementare robustă*: Join cu badges și verificare existență.

    // NOTĂ: Filtrarea exactă pe "Level" calculat din JS e grea în SQL pur fără logica duplicată.
    // Vom adăuga filtrare pe points ca proxy sau lăsăm filtrarea de level pe client DACA setul e mic.
    // DAR userul a zis 10k. 
    // Compromis: Filtrare pe points e server-side. Filtrarea pe Level o facem server-side doar dacă e cerută explicit,
    // verificând prezența badge-ului 'lvlX'.

    // Mapare Level -> Badge Code (conform streak.ts)
    const levelBadges = {
      2: 'lvl2',
      3: 'lvl3',
      4: 'lvl4',
      5: 'lvl5'
    };

    if (minLevel > 1 && levelBadges[minLevel]) {
      // Trebuie să aibă badge-ul specific sau un streak badge mai mare
      // Asta e complicat. Vom filtra doar după badge-ul exact de nivel pentru moment.
      whereClause += ` AND EXISTS (
            SELECT 1 FROM user_badges ub 
            WHERE ub.user_id = u.id AND (ub.badge_code = $${paramIndex} OR ub.badge_code LIKE 'streak_%')
        )`;
      values.push(levelBadges[minLevel]);
      paramIndex++;
    }

    // Query pentru Total Count (pentru paginare)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN (SELECT user_id, points as total FROM user_points) points ON u.id = points.user_id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, values.slice(0, paramIndex - 1)); // Use only WHERE params
    const total = parseInt(countResult.rows[0].total, 10);

    // Query Principal
    const query = `
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.role, 
        p.avatar_url AS "avatarUrl", 
        p.headline,
        COALESCE(points.total, 0) as points,
        COALESCE(badges.list, '[]'::json) as badges
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN (
        SELECT user_id, points as total FROM user_points
      ) points ON u.id = points.user_id
      LEFT JOIN (
        SELECT user_id, json_agg(badge_code) as list FROM user_badges GROUP BY user_id
      ) badges ON u.id = badges.user_id
      ${whereClause}
      ORDER BY COALESCE(points.total, 0) DESC, u.id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    const { rows } = await pool.query(query, values);

    return {
      students: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateProfile(userId, data) {
    const {
      name, headline, bio,
      avatarUrl, avatarDataUrl,
      skills = [], social = {},
      education = [], experience = [],
      portfolioMedia = [],
      location = "",
      opportunityRefs = []
    } = data;

    const avatar = avatarUrl || avatarDataUrl || null;

    // Transactional update
    const result = await pointsManager.performTransaction(async (client) => {
      // Update Core Profile
      await this.repository.upsertProfile(userId, {
        name, headline, bio, avatar, skills, social, location, opportunityRefs
      }, client);

      // Update Related Tables
      await this.repository.updateEducation(userId, education, client);
      await this.repository.updateExperience(userId, experience, client);
      await this.repository.updatePortfolioMedia(userId, portfolioMedia, client);

      // ── Profile Completion Check (one-time 10 pts) ──────────────────
      const isComplete = name && name.trim().length > 0
        && headline && headline.trim().length > 0
        && bio && bio.trim().length > 0
        && skills && skills.length >= 1
        && education && education.length >= 1
        && experience && experience.length >= 1;

      if (isComplete) {
        // Check if already awarded
        const { rowCount } = await client.query(
          "SELECT 1 FROM user_point_events WHERE user_id = $1 AND reason = 'profile_complete'",
          [userId]
        );

        if (rowCount === 0) {
          await pointsManager.addPoints(userId, 10, 'profile_complete', client);

          // Push notification (non-blocking)
          try {
            const { notificationQueue } = require('../workers');
            notificationQueue.add("user-notification", {
              userId,
              title: "Profil complet! 🎉",
              body: "Ai primit 10 puncte bonus pentru completarea profilului.",
              icon: '/albastru.svg',
              url: '/student'
            }, { removeOnComplete: true }).catch(() => { });
          } catch (_) { }
        }
      }

      return { ok: true };
    });

    return result;
  }
}

module.exports = new StudentService();
