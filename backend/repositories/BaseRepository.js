const { pool } = require("../db");

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  /**
   * Fetch rows with pagination support.
   * @param {object} client - DB client or pool
   * @param {number} limit  - Rows per page (default 20)
   * @param {number} offset - Rows to skip (default 0, e.g. (page-1)*limit)
   */
  async findAll(client = this.pool, limit = 20, offset = 0) {
    const query = `SELECT * FROM ${this.tableName} ORDER BY id DESC LIMIT $1 OFFSET $2`;
    const { rows } = await client.query(query, [limit, offset]);
    return rows;
  }

  async findById(id, client = this.pool) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const { rows } = await client.query(query, [id]);
    return rows[0];
  }

  async create(data, client = this.pool) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const indices = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO ${this.tableName} (${keys.join(", ")})
      VALUES (${indices})
      RETURNING *
    `;

    const { rows } = await client.query(query, values);
    return rows[0];
  }

  async update(id, data, client = this.pool) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await client.query(query, [id, ...values]);
    return rows[0];
  }

  async delete(id, client = this.pool) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
    const { rows } = await client.query(query, [id]);
    return rows[0];
  }
}

module.exports = BaseRepository;
