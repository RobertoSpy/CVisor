/**
 * Points Manager - Gestionare centralizată puncte
 *
 * REGULI:
 * - Punctele se acordă DOAR prin acest sistem
 * - Clientul NU poate modifica punctele direct (cu excepția repair-ului validat)
 */

const { pool } = require('../db');

// Constante pentru puncte
const POINTS = {
  SIGNUP: 10,
  DAILY_LOGIN: 5,
  BADGE_UNLOCK: 5,
  OPPORTUNITY_CREATE: 5,
  REPAIR_COST: -20
};

/**
 * Adaugă puncte pentru un user (DOAR apelare internă din backend)
 * @param {number} userId
 * @param {number} pointsDelta
 * @param {string} reason
 */
async function addPoints(userId, pointsDelta, reason) {
  // Validare parametri
  if (!userId || typeof pointsDelta !== 'number' || !reason) {
    throw new Error('Invalid parameters for addPoints');
  }

  // Fetch current
  const { rows } = await pool.query(
    "SELECT points FROM user_points WHERE user_id=$1",
    [userId]
  );

  let current = rows[0]?.points ?? 0;
  let newPoints = Math.max(current + pointsDelta, 0); // Nu permit puncte negative

  // Update points
  await pool.query(
    `INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, $2, NOW())
    ON CONFLICT (user_id) DO UPDATE SET points = $2, updated_at = NOW()`,
    [userId, newPoints]
  );

  // Log event
  await pool.query(
    "INSERT INTO user_point_events (user_id, points_delta, reason) VALUES ($1, $2, $3)",
    [userId, pointsDelta, reason]
  );

  return newPoints;
}

/**
 * Acordă puncte pentru signup
 */
async function awardSignupPoints(userId) {
  return addPoints(userId, POINTS.SIGNUP, 'signup');
}

/**
 * Acordă puncte pentru daily login
 */
async function awardDailyLoginPoints(userId) {
  return addPoints(userId, POINTS.DAILY_LOGIN, 'daily_login');
}

/**
 * Acordă puncte pentru badge unlock
 */
async function awardBadgePoints(userId, badgeName) {
  return addPoints(userId, POINTS.BADGE_UNLOCK, `badge_unlock:${badgeName}`);
}

/**
 * Acordă puncte pentru opportunity create (organizații)
 */
async function awardOpportunityCreatePoints(userId) {
  return addPoints(userId, POINTS.OPPORTUNITY_CREATE, 'opportunity_create');
}

/**
 * Procesare streak repair (costă puncte)
 * ACEASTA este singura funcție pe care frontend-ul o poate apela!
 */
async function processStreakRepair(userId, repairedDate) {
  if (!repairedDate) {
    throw new Error('repaired_date is required');
  }

  // Verifică dacă user-ul are suficiente puncte
  const { rows } = await pool.query(
    "SELECT points FROM user_points WHERE user_id=$1",
    [userId]
  );

  const currentPoints = rows[0]?.points ?? 0;
  if (currentPoints < Math.abs(POINTS.REPAIR_COST)) {
    throw new Error('Insufficient points for repair');
  }

  // Scade punctele
  const newPoints = await addPoints(userId, POINTS.REPAIR_COST, 'repair');

  // Salvează repair în tabelul dedicat
  await pool.query(
    "INSERT INTO user_streak_repairs (user_id, repaired_date) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [userId, repairedDate]
  );

  return { newPoints, repairedDate };
}

/**
 * Obține punctele curente ale unui user
 */
async function getUserPoints(userId) {
  const { rows } = await pool.query(
    "SELECT points FROM user_points WHERE user_id=$1",
    [userId]
  );
  return rows[0]?.points ?? 0;
}

module.exports = {
  POINTS,
  addPoints,
  awardSignupPoints,
  awardDailyLoginPoints,
  awardBadgePoints,
  awardOpportunityCreatePoints,
  processStreakRepair,
  getUserPoints
};
