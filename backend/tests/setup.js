// =============================================================
// tests/setup.js — Global test setup, runs before every test file
// =============================================================

// ── 1. Mock rate-limit-redis FIRST (before ioredis) ─────────
// rate-limit-redis uses Redis EVAL scripts; mock the whole store
// so the middleware passes all requests through in tests.
jest.mock('rate-limit-redis', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      // RedisStore interface required by express-rate-limit
      init: jest.fn(),
      increment: jest.fn().mockResolvedValue({ totalHits: 1, resetTime: new Date() }),
      decrement: jest.fn().mockResolvedValue(),
      resetKey: jest.fn().mockResolvedValue(),
      resetAll: jest.fn().mockResolvedValue(),
      localKeys: false,
      prefix: 'rl:',
    })),
  };
});

// ── 2. Mock Redis (IORedis) ──────────────────────────────────
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  }));
});

// ── 2. Mock BullMQ Queues (prevent Redis connections) ────────
jest.mock('../queues', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job' }),
    close: jest.fn().mockResolvedValue(),
  },
  videoQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job' }),
    close: jest.fn().mockResolvedValue(),
  },
  newsletterQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job' }),
    close: jest.fn().mockResolvedValue(),
  },
}));

// ── 3. Mock BullMQ Workers (prevent open Worker handles) ─────
jest.mock('../workers', () => ({
  startWorkers: jest.fn(),
}));

// ── 4. Mock Cron Jobs ─────────────────────────────────────────
jest.mock('../jobs/archiver', () => ({
  startArchiver: jest.fn(),
  archiveExpiredOpportunities: jest.fn().mockResolvedValue(),
}));

jest.mock('../jobs/newsletter', () => ({
  startScheduler: jest.fn(),
  sendNewsletter: jest.fn().mockResolvedValue(),
}));

// ── 5. Suppress noise during tests ────────────────────────────
global.console = {
  ...console,
  log: jest.fn(),   // Comment this out if you need to debug
  debug: jest.fn(),
  info: jest.fn(),
};
