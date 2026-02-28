/**
 * Points Manager - Gestionare centralizată puncte
 *
 * REGULI:
 * - Punctele se acordă DOAR prin acest sistem
 * - Transaction Safe (ACID)
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
 * Helper: Execută o funcție în interiorul unei tranzacții
 */
async function performTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Adaugă puncte pentru un user (Internal & Transaction Safe)
 * @param {number} userId
 * @param {number} pointsDelta
 * @param {string} reason
 * @param {object} [client] - Optional DB client for transaction
 */
async function addPoints(userId, pointsDelta, reason, client = pool) {
  // Validare parametri
  if (!userId || typeof pointsDelta !== 'number' || !reason || typeof reason !== 'string') {
    throw new Error('Invalid parameters for addPoints');
  }

  // Fetch current (atomic lock if in transaction context)
  const { rows } = await client.query(
    "SELECT points FROM user_points WHERE user_id=$1",
    [userId]
  );

  let current = rows[0]?.points ?? 0;
  let newPoints = Math.max(current + pointsDelta, 0); // Nu permit puncte negative

  // Update points
  await client.query(
    `INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, $2, NOW())
    ON CONFLICT (user_id) DO UPDATE SET points = $2, updated_at = NOW()`,
    [userId, newPoints]
  );

  // Log event
  await client.query(
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
async function awardBadgePoints(userId, badgeName, client = pool) {
  return addPoints(userId, POINTS.BADGE_UNLOCK, `badge_unlock:${badgeName}`, client);
}

/**
 * Acordă puncte pentru opportunity create
 */
async function awardOpportunityCreatePoints(userId) {
  return addPoints(userId, POINTS.OPPORTUNITY_CREATE, 'opportunity_create');
}

/**
 * Procesare streak repair (ATOMIC TRANSACTION)
 */
async function processStreakRepair(userId, repairedDate) {
  if (!repairedDate) {
    throw new Error('repaired_date is required');
  }

  return performTransaction(async (client) => {
    // 1. Lock Row & Check Points
    const { rows } = await client.query(
      "SELECT points FROM user_points WHERE user_id=$1 FOR UPDATE",
      [userId]
    );

    const currentPoints = rows[0]?.points ?? 0;
    if (currentPoints < Math.abs(POINTS.REPAIR_COST)) {
      throw new Error('Insufficient points for repair');
    }

    // 2. Deduct Points
    const newPoints = await addPoints(userId, POINTS.REPAIR_COST, 'repair', client);

    // 3. Mark Repair
    await client.query(
      "INSERT INTO user_streak_repairs (user_id, repaired_date) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, repairedDate]
    );

    return { newPoints, repairedDate };
  });
}

/**
 * Procesare upgrade nivel (Atomic: Deduct Points + Unlock Badge)
 */
async function processLevelUpgradeTransaction(userId, level, cost) {
  if (!cost || cost <= 0) throw new Error("Invalid upgrade cost");

  return performTransaction(async (client) => {
    // 1. Lock & Check Balance
    const { rows } = await client.query(
      "SELECT points FROM user_points WHERE user_id=$1 FOR UPDATE",
      [userId]
    );
    const currentPoints = rows[0]?.points ?? 0;

    if (currentPoints < cost) {
      throw new Error('Insufficient points for upgrade');
    }

    // 2. Check if already has badge
    const badgeCode = `lvl${level}`;
    const badgeCheck = await client.query(
      "SELECT 1 FROM user_badges WHERE user_id=$1 AND badge_code=$2",
      [userId, badgeCode]
    );
    if (badgeCheck.rowCount > 0) {
      throw new Error('Level already unlocked');
    }

    // 3. Deduct Points
    const newPoints = await addPoints(userId, -cost, `upgrade_lvl${level}`, client);

    // 4. Unlock Badge
    await client.query(
      "INSERT INTO user_badges (user_id, badge_code, unlocked_at) VALUES ($1, $2, NOW())",
      [userId, badgeCode]
    );

    return { newPoints, badgeCode };
  });
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
  performTransaction,
  awardSignupPoints,
  awardDailyLoginPoints,
  awardBadgePoints,
  awardOpportunityCreatePoints,
  processStreakRepair,
  processLevelUpgradeTransaction,
  getUserPoints
};
