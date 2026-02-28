const BaseRepository = require("./BaseRepository");

class OpportunityRepository extends BaseRepository {
  constructor() {
    super("opportunities");
  }

  /**
   * Fetch opportunities with dynamic filtering
   */
  async findWithFilters(filters = {}, client = this.pool) {
    let query = `
      SELECT o.id, o.title, u.full_name AS "orgName", o.type, o.skills, 
             o.deadline, o.banner_image, o.promo_video, o.created_at, o.status
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
    `;

    const params = [];
    let whereClauses = [`o.status != 'archived'`];

    // Filter by period (today)
    if (filters.period === 'today') {
      whereClauses.push(`o.created_at >= CURRENT_DATE`);
    }

    // Filter by search query (title, orgName, skills)
    if (filters.q) {
      const q = filters.q.toString().trim().toLowerCase();
      const searchParam = `%${q}%`;
      params.push(searchParam);

      whereClauses.push(`(
        o.title ILIKE $${params.length} OR 
        u.full_name ILIKE $${params.length} OR 
        array_to_string(o.skills, ',') ILIKE $${params.length}
      )`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY o.id DESC`;

    const { rows } = await client.query(query, params);
    return rows;
  }

  async findDetailedById(id, client = this.pool) {
    const query = `
      SELECT id, title, type, skills, deadline, available_spots, price, 
             banner_image, promo_video, location, tags, 
             agenda, faq, description, cta_url
      FROM opportunities 
      WHERE id = $1
    `;
    const { rows } = await client.query(query, [id]);
    return rows[0];
  }

  // --- New Methods for Organization Flow ---

  async createOpportunity(data, client = this.pool) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const indices = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO opportunities (${keys.join(", ")})
      VALUES (${indices})
      RETURNING *
    `;
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  async updateOpportunity(id, userId, data, client = this.pool) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    // Start parameter index at 3 because $1 is id, $2 is userId
    const setClause = keys.map((key, i) => `${key} = $${i + 3}`).join(", ");

    const query = `
      UPDATE opportunities 
      SET ${setClause}
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const { rows } = await client.query(query, [id, userId, ...values]);
    return rows[0];
  }

  async deleteOpportunity(id, userId, client = this.pool) {
    const query = `
      DELETE FROM opportunities 
      WHERE id = $1 AND user_id = $2 
      RETURNING *
    `;
    const { rows } = await client.query(query, [id, userId]);
    return rows[0];
  }

  async findExploreById(id, client = this.pool) {
    const query = `
      SELECT o.*, u.full_name as organization_name 
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    const { rows } = await client.query(query, [id]);
    return rows[0];
  }

  async findExploreOthers(userId, client = this.pool) {
    const query = `
      SELECT o.*, u.full_name as organization_name 
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id != $1 
      ORDER BY o.id DESC
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  }

  async findByUserIdAndStatus(userId, status, client = this.pool) {
    const query = `
      SELECT * FROM opportunities 
      WHERE user_id = $1 AND status = $2
      ORDER BY id DESC
    `;
    const { rows } = await client.query(query, [userId, status]);
    return rows;
  }

  async findByUserId(userId, client = this.pool) {
    const query = `
      SELECT * FROM opportunities 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  }

  async findByIdAndUser(id, userId, client = this.pool) {
    const query = `
      SELECT * FROM opportunities 
      WHERE id = $1 AND user_id = $2
    `;
    const { rows } = await client.query(query, [id, userId]);
    return rows[0];
  }
}

module.exports = new OpportunityRepository();
