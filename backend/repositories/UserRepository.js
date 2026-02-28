const BaseRepository = require("./BaseRepository");

class UserRepository extends BaseRepository {
  constructor() {
    super("users");
  }

  async findByEmail(email, client = this.pool) {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1`;
    const { rows } = await client.query(query, [email]);
    return rows[0];
  }

  async saveUser(userData, client = this.pool) {
    return this.create(userData, client);
  }

  async setUserVerified(email, client = this.pool) {
    return client.query(
      `UPDATE ${this.tableName} SET is_verified = TRUE WHERE email = $1`,
      [email]
    );
  }

  async setVerificationCode(email, code, client = this.pool) {
    return client.query(
      `UPDATE ${this.tableName} SET email_verification_code = $1 WHERE email = $2`,
      [code, email]
    );
  }

  async updatePassword(email, hashedPassword, client = this.pool) {
    return client.query(
      `UPDATE ${this.tableName} SET password = $1, email_verification_code = NULL WHERE email = $2`,
      [hashedPassword, email]
    );
  }

  /**
   * Insert initial badge for a user on signup (idempotent).
   */
  async insertInitialBadge(userId, badgeCode = 'lvl1', client = this.pool) {
    return client.query(
      "INSERT INTO user_badges (user_id, badge_code, unlocked_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING",
      [userId, badgeCode]
    );
  }

  async updateUnverifiedUser(email, fullName, hashedPassword, code, client = this.pool) {
    const query = `
      UPDATE ${this.tableName} 
      SET full_name = $1, 
          password = $2, 
          email_verification_code = $3 
      WHERE email = $4 AND is_verified = FALSE
      RETURNING *
    `;
    const { rows } = await client.query(query, [fullName, hashedPassword, code, email]);
    return rows[0];
  }
}

module.exports = new UserRepository();
