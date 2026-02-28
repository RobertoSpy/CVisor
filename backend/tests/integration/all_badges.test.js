const request = require('supertest');
const { pool } = require('../../db');

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock('../../workers', () => ({ startWorkers: jest.fn() }));

jest.mock('../../middleware/verifyToken', () => (req, res, next) => {
  req.user = { id: 1, role: 'student' };
  next();
});

// Badge unlock uses performTransaction -> pool.connect -> client
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};
pool.connect.mockResolvedValue(mockClient);

const app = require('../../app');

// Only the 5 REAL badges defined in frontend/src/app/student/lib/streak.ts
const ALL_BADGES = ['lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5'];

describe('All Badges Unlock Scenario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  test('User should be able to unlock all 5 level badges sequentially', async () => {
    for (const badge of ALL_BADGES) {
      // performTransaction: BEGIN -> check -> insert -> awardBadgePoints queries -> COMMIT
      mockClient.query
        .mockResolvedValueOnce({})                    // BEGIN
        .mockResolvedValueOnce({ rowCount: 0 })       // Check not unlocked yet
        .mockResolvedValueOnce({ rowCount: 1 })       // Insert badge
        .mockResolvedValueOnce({ rows: [{ points: 10 }] }) // awardBadgePoints: GET current points
        .mockResolvedValueOnce({ rowCount: 1 })       // awardBadgePoints: INSERT/UPDATE points
        .mockResolvedValueOnce({ rowCount: 1 })       // awardBadgePoints: INSERT event
        .mockResolvedValueOnce({});                   // COMMIT

      const res = await request(app)
        .post('/api/students/badges/unlock')
        .send({ badge_code: badge });

      if (res.statusCode !== 200) {
        console.error(`Failed to unlock ${badge}:`, res.body);
      }
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    }
  });

  test('User CANNOT re-unlock badges', async () => {
    // performTransaction: BEGIN -> check -> finds rowCount=1 -> throws -> ROLLBACK
    mockClient.query
      .mockResolvedValueOnce({})               // BEGIN
      .mockResolvedValueOnce({ rowCount: 1 })  // Already unlocked
      .mockResolvedValueOnce({});              // ROLLBACK

    const res = await request(app)
      .post('/api/students/badges/unlock')
      .send({ badge_code: 'lvl1' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Badge already unlocked');
  });
});
