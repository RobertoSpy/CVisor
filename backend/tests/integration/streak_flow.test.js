const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../db');

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Mock verifyToken
jest.mock('../../middleware/verifyToken', () => (req, res, next) => {
  req.user = { id: 1, role: 'student' };
  next();
});

describe('Streak Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('User with 100 days streak should receive points and badge unlock', async () => {
    // 1. Simulate Pageview (Login)
    // Mock checks for existing login today (0 rows = new login)
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert app_event success
    pool.query.mockResolvedValueOnce({ rowCount: 0 }); // alreadyGotPoints = 0 (false)
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert points
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert point_event

    // Mock badge bonus check (badge_code provided in body)
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Has badge (simulating frontend checked it)
    pool.query.mockResolvedValueOnce({ rowCount: 0 }); // Has not got bonus yet
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert bonus points
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert bonus event

    const resPageview = await request(app)
      .post('/api/students/stats/pageview')
      .send({ badge_code: 'streak_100' });

    expect(resPageview.statusCode).toBe(200);
    expect(resPageview.body.points_awarded).toBe(true);

    // 2. Simulate Badge Unlock (Frontend calls this if it detects new badge)
    // Mock existence check (0 = not yet unlocked)
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert badge
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert points
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert event

    const resBadge = await request(app)
      .post('/api/students/badges/unlock')
      .send({ badge_code: 'streak_100' });

    expect(resBadge.statusCode).toBe(200);
    expect(resBadge.body.ok).toBe(true);
  });

  test('Repair Streak flow', async () => {
    // 1. Repair Call
    // Mock user points check (has 100 points)
    pool.query.mockResolvedValueOnce({ rows: [{ points: 100 }] });
    // Mock update points
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // points update
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // log event
    // Mock repair record
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // insert repair

    const resRepair = await request(app)
      .post('/api/students/points/add')
      .send({
        points_delta: -20,
        reason: 'repair',
        repaired_date: '2023-01-01'
      });

    expect(resRepair.statusCode).toBe(200);
    expect(resRepair.body.points).toBeDefined();
  });
});
