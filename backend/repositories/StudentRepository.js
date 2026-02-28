const BaseRepository = require("./BaseRepository");

class StudentRepository extends BaseRepository {
  constructor() {
    super("profiles"); // Base table is profiles
  }

  async getProfileWithUser(userId, client = this.pool) {
    const query = `
      SELECT COALESCE(p.name, u.full_name) as name,
             p.headline,
             p.bio,
             p.avatar_url AS "avatarUrl",
             p.skills,
             p.social,
             p.location,
             p.opportunity_refs,
             u.id as user_id,
             u.email
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id=$1
    `;
    const { rows } = await client.query(query, [userId]);
    return rows[0];
  }

  async getEducation(userId, client = this.pool) {
    const query = `
      SELECT id, school, degree, start_ym AS start, end_ym AS "end", details
      FROM education WHERE user_id=$1
      ORDER BY start_ym DESC NULLS LAST, id DESC
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  }

  async getExperience(userId, client = this.pool) {
    const query = `
      SELECT id, role, company, start_ym AS start, end_ym AS "end", details
      FROM experience WHERE user_id=$1
      ORDER BY start_ym DESC NULLS LAST, id DESC
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  }

  async getPortfolioMedia(userId, client = this.pool) {
    const query = `
      SELECT id, kind, url, caption
      FROM portfolio_media WHERE user_id=$1
      ORDER BY id ASC
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  }

  async upsertProfile(userId, profileData, client = this.pool) {
    const {
      name, headline, bio, avatar, skills, social, location, opportunityRefs
    } = profileData;

    const query = `
      INSERT INTO profiles (user_id, name, headline, bio, avatar_url, skills, social, location, opportunity_refs, updated_at)
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
        updated_at = NOW()
    `;

    return client.query(query, [
      userId,
      name || null,
      headline || null,
      bio || null,
      avatar,
      skills,
      JSON.stringify(social),
      location || null,
      JSON.stringify(opportunityRefs)
    ]);
  }

  async updateEducation(userId, educationList, client = this.pool) {
    await client.query("DELETE FROM education WHERE user_id=$1", [userId]);
    for (const e of educationList) {
      await client.query(
        `INSERT INTO education (user_id, school, degree, start_ym, end_ym, details)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [userId, e.school || "", e.degree || "", e.start || null, e.end || null, e.details || null]
      );
    }
  }

  async updateExperience(userId, experienceList, client = this.pool) {
    await client.query("DELETE FROM experience WHERE user_id=$1", [userId]);
    for (const e of experienceList) {
      await client.query(
        `INSERT INTO experience (user_id, role, company, start_ym, end_ym, details)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [userId, e.role || "", e.company || "", e.start || null, e.end || null, e.details || null]
      );
    }
  }

  async updatePortfolioMedia(userId, mediaList, client = this.pool) {
    await client.query("DELETE FROM portfolio_media WHERE user_id=$1", [userId]);
    for (const m of mediaList) {
      await client.query(
        `INSERT INTO portfolio_media (user_id, kind, url, caption)
         VALUES ($1, $2, $3, $4)`,
        [userId, m.kind, m.url, m.caption || null]
      );
    }
  }
}

module.exports = new StudentRepository();
