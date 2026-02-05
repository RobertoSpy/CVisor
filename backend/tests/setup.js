// Mock Redis globally with a compatible class structure for IORedis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn(),
    quit: jest.fn(),
    // Add other methods if needed by rate-limit-redis
  }));
});

// Mock Cron Jobs components to prevent causing open handles
jest.mock('../jobs/archiver', () => ({
  startArchiver: jest.fn(),
  archiveExpiredOpportunities: jest.fn(),
}));

jest.mock('../jobs/newsletter', () => ({
  startScheduler: jest.fn(),
  sendNewsletter: jest.fn(),
}));

// Suppress console.log during tests
global.console = {
  ...console,
  // log: jest.fn(), 
  debug: jest.fn(),
  info: jest.fn(),
};
