const request = require('supertest');
const { notificationQueue, videoQueue, newsletterQueue } = require("../../queues");
const { pool } = require('../../db');

// Mocks
jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock('../../middleware/verifyToken', () => (req, res, next) => {
  req.user = { id: 1, role: 'organization', full_name: 'Test Org' };
  next();
});

jest.mock('../../middleware/verifyOrg', () => (req, res, next) => {
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
jest.mock('../../jobs/newsletter', () => ({
  startScheduler: jest.fn(),
}));
jest.mock('../../jobs/archiver', () => ({
  startArchiver: jest.fn(),
}));
jest.mock('../../workers', () => ({ startWorkers: jest.fn() }));

// Mock Queues — jest.mock() is hoisted, so we cannot reference external const here.
// Use jest.fn() inline. Access via require() if assertions needed.
jest.mock('../../queues', () => ({
  notificationQueue: { add: jest.fn().mockResolvedValue({ id: 'mock-job' }) },
  videoQueue: { add: jest.fn().mockResolvedValue({ id: 'mock-job' }) },
  newsletterQueue: { add: jest.fn().mockResolvedValue({ id: 'mock-job' }) },
}));

// Mock PointsManager (optional, but since we mock DB, we can let it run or mock it too)
// If we let it run, we need to mock pool.connect() to return a client
// Let's mock pool.connect() to handle transactions

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

pool.connect.mockResolvedValue(mockClient);

// Valid opportunity data
const validOpportunity = {
  title: "Internship Java",
  type: "internship",
  skills: ["Java", "Spring"],
  deadline: "2030-01-01", // Future date
  description: "Great opportunity",
  available_spots: 5,
  promo_video: "/uploads/intro.mp4"
};

const app = require('../../app'); // Import after mocks

describe('Opportunity Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query.mockReset();
    mockClient.query.mockReset();
  });

  test('POST /api/organization/opportunities - Success Transaction', async () => {
    // 1. Mock Transaction Flow
    // performTransaction calls: pool.connect -> client.query('BEGIN') -> callback -> client.query('COMMIT')

    // Mock BEGIN
    mockClient.query.mockResolvedValueOnce({});

    // Mock INSERT opportunity (Repository.createOpportunity)
    const mockCreatedOpp = { id: 101, ...validOpportunity, user_id: 1 };
    mockClient.query.mockResolvedValueOnce({ rows: [mockCreatedOpp] });

    // Mock Points Check (pointsManager.addPoints -> SELECT points)
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 10 }] });

    // Mock Points Insert (pointsManager.addPoints -> INSERT points)
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    // Mock Points Event (pointsManager.addPoints -> INSERT event)
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    // Mock COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/organizations/opportunities')
      .send(validOpportunity);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(101);
    expect(res.body.pointsAdded).toBe(5);

    // Verify Transaction was used
    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

    // Verify Queue calls
    const queues = require('../../queues');
    expect(queues.notificationQueue.add).toHaveBeenCalled();
    expect(queues.videoQueue.add).toHaveBeenCalled();
  });

  test('POST /api/organization/opportunities - Validation Error (Past Date)', async () => {
    const pastOpportunity = { ...validOpportunity, deadline: "2000-01-01" };

    const res = await request(app)
      .post('/api/organizations/opportunities')
      .send(pastOpportunity);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/trecut/i);

    // Should not start transaction (validation is before)
    // Or if it starts, it shouldn't proceed to insert.
    // Our service calls performTransaction AFTER validation.
    expect(pool.connect).not.toHaveBeenCalled();
  });
});
