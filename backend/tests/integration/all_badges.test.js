const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../db');

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('../../middleware/verifyToken', () => (req, res, next) => {
  req.user = { id: 1, role: 'student' };
  next();
});

const ALL_BADGES = [
  'streak_3', 'streak_7', 'streak_14', 'streak_30', 'streak_50', 'streak_100', 'streak_365',
  'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5',
  'early_bird', 'night_owl', 'social_butterfly'
];

describe('All Badges Unlock Scenario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('User should be able to unlock ALL badges sequentially', async () => {
    for (const badge of ALL_BADGES) {
      // 1. Check if badge exists (mock returning 0 rows = not yet unlocked)
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      // 2. Insert Badge
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      // 3. Award Points (Check/Insert/Log) for the badge
      // The implementation does:
      // INSERT user_points ...
      pool.query.mockResolvedValueOnce({ rowCount: 1 });
      // INSERT user_point_events ...
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .post('/api/students/badges/unlock')
        .send({ badge_code: badge });

      if (res.statusCode !== 200) {
        console.error(`Failed to unlock ${badge}:`, res.body);
      }
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    }

    // Check total interactions with DB
    // 4 queries per badge * 15 badges = 60 calls
    expect(pool.query).toHaveBeenCalledTimes(ALL_BADGES.length * 4);
  });

  test('User CANNOT re-unlock badges (e.g. after losing streak)', async () => {
    const BADGE_TO_TEST = 'streak_3';

    // 1. Check if badge exists (Mock returning 1 row = ALREADY UNLOCKED)
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    // We don't need to mock insert/points because logic should stop here.

    const res = await request(app)
      .post('/api/students/badges/unlock')
      .send({ badge_code: BADGE_TO_TEST });

    // Expect 400 because backend says "Badge already unlocked"
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Badge already unlocked');
  });
});
