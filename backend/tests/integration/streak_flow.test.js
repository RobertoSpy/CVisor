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

// Mock client for transactions (used by recordDailyLogin / streak repair)
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

const app = require('../../app');

describe('Streak Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  test('Pageview records login and awards daily points', async () => {
    // recordDailyLogin uses performTransaction → pool.connect → client.query
    // Inside the transaction:
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. INSERT app_events (login event — INSERT ... WHERE NOT EXISTS)
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 3. Check if daily points already awarded (SELECT from user_point_events)
    mockClient.query.mockResolvedValueOnce({ rowCount: 0 });
    // 4. addPoints → SELECT current points
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 50 }] });
    // 5. addPoints → INSERT/UPDATE user_points
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 6. addPoints → INSERT user_point_events (log)
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 7. _calculateAndAwardStreak → CTE streak query
    mockClient.query.mockResolvedValueOnce({ rows: [{ streak: 1 }] });
    // 8. COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/stats/pageview')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('Repair Streak flow deducts 20 points', async () => {
    // processStreakRepair uses performTransaction → pool.connect → client.query
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. SELECT points ... FOR UPDATE (lock row)
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 100 }] });
    // 3. addPoints(-20, 'repair') → SELECT current points
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 100 }] });
    // 4. addPoints → INSERT/UPDATE user_points
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 5. addPoints → INSERT user_point_events
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 6. INSERT user_streak_repairs
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 7. COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/points/add')
      .send({
        points_delta: -20,
        reason: 'repair',
        repaired_date: '2024-01-01'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.points).toBeDefined();
  });
});
