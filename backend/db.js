const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function getUserByEmail(email) {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
}

async function saveUser({ full_name, email, password, role, is_verified, email_verification_code }) {
  return pool.query(
    `INSERT INTO users (full_name, email, password, role, is_verified, email_verification_code)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [full_name, email, password, role, is_verified, email_verification_code]
  );
}

async function setUserVerified(email) {
  return pool.query(
    "UPDATE users SET is_verified = TRUE WHERE email = $1",
    [email]
  );
}

module.exports = {
  getUserByEmail,
  saveUser,
  pool,
  setUserVerified,
};