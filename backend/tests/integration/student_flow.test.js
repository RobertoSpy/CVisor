const request = require('supertest');
const { pool } = require('../../db');

// Mocks
jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock('../../middleware/verifyToken', () => (req, res, next) => {
  req.user = { id: 1, email: 'student@test.com', role: 'student' };
  next();
});

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    call: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  }));
});

// Mock Jobs
jest.mock('../../jobs/newsletter', () => ({ startScheduler: jest.fn() }));
jest.mock('../../jobs/archiver', () => ({ startArchiver: jest.fn() }));
jest.mock('../../workers', () => ({ startWorkers: jest.fn() }));

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

pool.connect.mockResolvedValue(mockClient);

const app = require('../../app');

describe('Student Profile Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/users/me - Success', async () => {
    // Mock user profile query
    pool.query.mockResolvedValueOnce({
      rows: [{
        name: "Student Test",
        headline: "Learner",
        bio: "Bio",
        avatarUrl: null,
        skills: ["JS"],
        social: {},
        location: "Bucharest",
        opportunity_refs: []
      }]
    });
    // Mock education
    pool.query.mockResolvedValueOnce({ rows: [] });
    // Mock experience
    pool.query.mockResolvedValueOnce({ rows: [] });
    // Mock media
    pool.query.mockResolvedValueOnce({ rows: [] });
    // Mock points
    pool.query.mockResolvedValueOnce({ rows: [{ points: 100 }] });
    // Mock badges
    pool.query.mockResolvedValueOnce({ rows: [{ badge_code: 'lvl1' }] });

    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Student Test");
    expect(res.body.points).toBe(100);
    expect(res.body.badges).toContain('lvl1');
  });

  test('PUT /api/users/me - Transaction Success', async () => {
    // 1. Mock BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. Mock UPSERT profiles
    mockClient.query.mockResolvedValueOnce({});
    // 3. Mock DELETE education
    mockClient.query.mockResolvedValueOnce({});
    // 4. Mock INSERT education (if any)
    // 5. Mock DELETE experience
    mockClient.query.mockResolvedValueOnce({});
    // 6. Mock INSERT experience (if any)
    // 7. Mock DELETE portfolio
    mockClient.query.mockResolvedValueOnce({});
    // 8. Mock INSERT portfolio (if any)
    // 9. Mock COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .put('/api/users/me')
      .send({
        name: "New Name",
        skills: ["React"],
        education: [],
        experience: [],
        portfolioMedia: [],
        opportunityRefs: []
      });

    expect(res.status).toBe(200);
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });
});
