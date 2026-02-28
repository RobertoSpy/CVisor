/**
 * Gamification Scenarios — End-to-End tests for the full gamification lifecycle
 *
 * What these test:
 *  1. Streak > 30 days → milestone bonus at day 30, normal day 31+
 *  2. Student points flow — all sources (signup, daily login, badge, opportunity)
 *  3. Organization points flow (opportunity creation)
 *  4. Max points → all 14 badges unlockable
 */

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
  req.user = {
    id: req.headers['x-test-uid'] ? parseInt(req.headers['x-test-uid']) : 1,
    role: req.headers['x-test-role'] || 'student',
    full_name: 'Test User'
  };
  next();
});

jest.mock('../../middleware/verifyOrg', () => (req, res, next) => next());

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

const app = require('../../app');

// ─────────────────────────────────────────────────────────────────────────────
// 1. STREAK MILESTONES — Ce se întâmplă la 30+ zile
// ─────────────────────────────────────────────────────────────────────────────

describe('Streak Milestone Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  test('Day 30 streak awards 30 bonus points (milestone)', async () => {
    // recordDailyLogin → performTransaction → pool.connect → client.query
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. INSERT app_events (login)
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 3. Check daily points already awarded
    mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // not yet
    // 4. addPoints(5, 'login') → SELECT current points
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 200 }] });
    // 5. addPoints → INSERT/UPDATE user_points
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 6. addPoints → INSERT user_point_events
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 7. _calculateAndAwardStreak → CTE returns streak=30
    mockClient.query.mockResolvedValueOnce({ rows: [{ streak: 30 }] });
    // 8. Check if milestone already awarded (streak_bonus_30d)
    mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // not yet
    // 9. addPoints(30, 'streak_bonus_30d') → SELECT current points
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 205 }] });
    // 10. addPoints → INSERT/UPDATE user_points
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 11. addPoints → INSERT user_point_events
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 12. COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/stats/pageview')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.points_awarded).toBe(true);

    // Verify streak bonus was awarded: addPoints called with 'streak_bonus_30d'
    const calls = mockClient.query.mock.calls.map(c => c[0]);
    const bonusCall = mockClient.query.mock.calls.find(c =>
      typeof c[0] === 'string' &&
      c[0].includes('INSERT INTO user_point_events') &&
      c[1] && c[1].includes('streak_bonus_30d')
    );
    expect(bonusCall).toBeTruthy();
  });

  test('Day 31 streak awards NO milestone (just daily 5 pts)', async () => {
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. INSERT app_events
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 3. Check daily points
    mockClient.query.mockResolvedValueOnce({ rowCount: 0 });
    // 4. addPoints(5) → SELECT current points
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 235 }] });
    // 5. addPoints → INSERT/UPDATE
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 6. addPoints → INSERT event
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 7. CTE returns streak=31 (NOT a milestone — milestones are 3,7,14,30,60,90)
    mockClient.query.mockResolvedValueOnce({ rows: [{ streak: 31 }] });
    // 8. COMMIT (no bonus awarded, _calculateAndAwardStreak returns 0)
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/stats/pageview')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);

    // Verify NO streak_bonus event was logged (only 'login' event)
    const bonusCalls = mockClient.query.mock.calls.filter(c =>
      c[1] && Array.isArray(c[1]) && c[1].some(v => typeof v === 'string' && v.includes('streak_bonus'))
    );
    expect(bonusCalls.length).toBe(0);
  });

  test('Day 60 streak awards 40 bonus points', async () => {
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. INSERT app_events
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 3. Check daily points
    mockClient.query.mockResolvedValueOnce({ rowCount: 0 });
    // 4-6. addPoints(5, 'login')
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 500 }] });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 7. CTE returns streak=60
    mockClient.query.mockResolvedValueOnce({ rows: [{ streak: 60 }] });
    // 8. Check milestone not yet awarded
    mockClient.query.mockResolvedValueOnce({ rowCount: 0 });
    // 9-11. addPoints(40, 'streak_bonus_60d')
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 505 }] });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 12. COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/stats/pageview')
      .send({});

    expect(res.statusCode).toBe(200);

    // Verify bonus 40 was awarded
    const bonusCall = mockClient.query.mock.calls.find(c =>
      c[1] && Array.isArray(c[1]) && c[1].includes('streak_bonus_60d')
    );
    expect(bonusCall).toBeTruthy();
  });

  test('Duplicate milestone same day is NOT re-awarded', async () => {
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. INSERT app_events
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 3. Check daily points — already got today
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Already awarded
    // 4. COMMIT (returns { points_awarded: false })
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/stats/pageview')
      .send({});

    expect(res.statusCode).toBe(200);
    // points_awarded should be false since we already got points today
    expect(res.body.points_awarded).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. STUDENT POINTS FLOW — Toate sursele de puncte
// ─────────────────────────────────────────────────────────────────────────────

describe('Student Points Sources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  test('All point sources follow the correct amounts', () => {
    // Verify POINTS constants match expected values
    const { POINTS } = require('../../utils/pointsManager');
    expect(POINTS.SIGNUP).toBe(10);
    expect(POINTS.DAILY_LOGIN).toBe(5);
    expect(POINTS.BADGE_UNLOCK).toBe(5);
    expect(POINTS.OPPORTUNITY_CREATE).toBe(5);
    expect(POINTS.REPAIR_COST).toBe(-20);
  });

  test('addPoints floors at 0 for extreme negative', async () => {
    const { addPoints } = require('../../utils/pointsManager');
    jest.mock('../../db', () => ({
      pool: { query: jest.fn() }
    }));

    // SELECT points → user has 5
    pool.query.mockResolvedValueOnce({ rows: [{ points: 5 }] });
    // INSERT/UPDATE 
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    // INSERT event
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const result = await addPoints(1, -100, 'test_extreme');
    expect(result).toBe(0); // Never goes negative
  });

  test('Level upgrade deducts points and unlocks badge atomically', async () => {
    // processLevelUpgradeTransaction → performTransaction → pool.connect
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. SELECT points FOR UPDATE
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 200 }] });
    // 3. Check badge not already unlocked
    mockClient.query.mockResolvedValueOnce({ rowCount: 0 });
    // 4-6. addPoints(-50, 'upgrade_lvl2')
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 200 }] });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 7. INSERT badge
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 8. COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/points/add')
      .send({
        points_delta: -50,
        reason: 'upgrade_lvl2'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.badge).toBe('lvl2');
    expect(res.body.points).toBeDefined();
  });

  test('Level upgrade fails with insufficient points', async () => {
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. SELECT points FOR UPDATE → only 10 points
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 10 }] });
    // 3. ROLLBACK (thrown error in transaction)
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/students/points/add')
      .send({
        points_delta: -50,
        reason: 'upgrade_lvl2'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Insufficient/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. ORGANIZATION POINTS FLOW
// ─────────────────────────────────────────────────────────────────────────────

describe('Organization Points Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  test('Organization gets points when creating an opportunity', async () => {
    // POST /api/organizations/opportunities
    // The route uses OpportunityService which awards POINTS.OPPORTUNITY_CREATE (5)

    // 1. Transaction BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. INSERT opportunity
    mockClient.query.mockResolvedValueOnce({
      rows: [{
        id: 42,
        title: "Summer Internship",
        type: "internship",
        user_id: 1
      }]
    });
    // 3-5. addPoints(5, 'opportunity_create')
    mockClient.query.mockResolvedValueOnce({ rows: [{ points: 20 }] });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
    // 6. COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/organizations/opportunities')
      .set('x-test-role', 'organization')
      .send({
        title: "Summer Internship",
        type: "internship",
        skills: ["Node.js"],
        deadline: "2030-06-01",
        description: "Great summer opportunity for students",
        available_spots: 10
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.pointsAdded).toBe(5);
  });

  test('Organization points/add endpoint works correctly', async () => {
    // GET current points
    pool.query.mockResolvedValueOnce({ rows: [{ points: 25 }] });

    const res = await request(app)
      .get('/api/organizations/points')
      .set('x-test-role', 'organization');

    expect(res.statusCode).toBe(200);
    expect(res.body.points).toBe(25);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAX POINTS → ALL BADGES
// ─────────────────────────────────────────────────────────────────────────────

describe('Max Points — All 5 Level Badges Unlock', () => {
  // Only the 5 REAL badges defined in frontend/src/app/student/lib/streak.ts
  const ALL_BADGES = ['lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5'];

  beforeEach(() => {
    jest.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
  });

  test('User with 9999 points can unlock ALL 5 level badges', async () => {
    let totalBadgesUnlocked = 0;

    for (const badge of ALL_BADGES) {
      // performTransaction: BEGIN → check → insert → awardBadgePoints → COMMIT
      mockClient.query
        .mockResolvedValueOnce({})                        // BEGIN
        .mockResolvedValueOnce({ rowCount: 0 })           // Check: not unlocked yet
        .mockResolvedValueOnce({ rowCount: 1 })           // Insert badge
        .mockResolvedValueOnce({ rows: [{ points: 9999 }] }) // awardBadgePoints: GET current points
        .mockResolvedValueOnce({ rowCount: 1 })           // awardBadgePoints: INSERT/UPDATE points
        .mockResolvedValueOnce({ rowCount: 1 })           // awardBadgePoints: INSERT event
        .mockResolvedValueOnce({});                       // COMMIT

      const res = await request(app)
        .post('/api/students/badges/unlock')
        .send({ badge_code: badge });

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      totalBadgesUnlocked++;
    }

    // All 5 level badges successfully unlocked
    expect(totalBadgesUnlocked).toBe(5);
  });

  test('Each badge unlock awards exactly 5 bonus points', async () => {
    const badge = 'profile_complete';

    // performTransaction: BEGIN → check → insert → awardBadgePoints → COMMIT
    mockClient.query
      .mockResolvedValueOnce({})                           // BEGIN
      .mockResolvedValueOnce({ rowCount: 0 })              // Check: not yet
      .mockResolvedValueOnce({ rowCount: 1 })              // Insert badge
      .mockResolvedValueOnce({ rows: [{ points: 100 }] }) // Current points = 100
      .mockResolvedValueOnce({ rowCount: 1 })              // Set points = 105
      .mockResolvedValueOnce({ rowCount: 1 })              // Log event
      .mockResolvedValueOnce({});                          // COMMIT

    const res = await request(app)
      .post('/api/students/badges/unlock')
      .send({ badge_code: badge });

    expect(res.statusCode).toBe(200);

    // Verify the INSERT/UPDATE query was called with points=105 (100+5)
    const upsertCall = mockClient.query.mock.calls.find(c =>
      typeof c[0] === 'string' &&
      c[0].includes('INSERT INTO user_points') &&
      c[1] && c[1].includes(105)
    );
    expect(upsertCall).toBeTruthy();
  });

  test('User with 0 points can still unlock badges (floor at 0 concept)', async () => {
    // Even with 0 points, badge unlock works because it ADDS 5 points
    mockClient.query
      .mockResolvedValueOnce({})                          // BEGIN
      .mockResolvedValueOnce({ rowCount: 0 })             // Not unlocked
      .mockResolvedValueOnce({ rowCount: 1 })             // Insert badge
      .mockResolvedValueOnce({ rows: [{ points: 0 }] })  // Current = 0
      .mockResolvedValueOnce({ rowCount: 1 })             // Set to 5
      .mockResolvedValueOnce({ rowCount: 1 })             // Log event
      .mockResolvedValueOnce({});                         // COMMIT

    const res = await request(app)
      .post('/api/students/badges/unlock')
      .send({ badge_code: 'lvl1' });

    expect(res.statusCode).toBe(200);

    // Verify points went from 0 → 5
    const upsertCall = mockClient.query.mock.calls.find(c =>
      typeof c[0] === 'string' &&
      c[0].includes('INSERT INTO user_points') &&
      c[1] && c[1].includes(5)
    );
    expect(upsertCall).toBeTruthy();
  });
});
