const { addPoints, POINTS } = require('../../utils/pointsManager');
const { pool } = require('../../db');

// Mock the database pool
jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('Gamification Logic - pointsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not allow negative points balance', async () => {
    // 1. Mock getUserPoints (via pool.query) to return 10 points
    pool.query.mockResolvedValueOnce({ rows: [{ points: 10 }] });

    // 2. Mock update/insert
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Update
    pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Log event

    // 3. Try to subtract 20 points
    // The implementation calculates newPoints = Math.max(10 - 20, 0) -> 0
    const newPoints = await addPoints(1, -20, 'test_negative');

    expect(newPoints).toBe(0);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_points'),
      expect.arrayContaining([1, 0]) // [userId, newPoints=0]
    );
  });

  test('should allow points addition', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ points: 10 }] });
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const newPoints = await addPoints(1, 50, 'bonus');
    expect(newPoints).toBe(60);
  });
});
