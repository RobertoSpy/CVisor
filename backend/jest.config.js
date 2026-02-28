module.exports = {
  testEnvironment: 'node',
  verbose: true,
  // Runs before every test file
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  // Kill jest after all tests finish even if open handles remain
  forceExit: true,
  // Timeout per test (10s), prevents hanging tests blocking CI forever
  testTimeout: 10000,
  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['text', 'lcov', 'html'],
  // Show which tests are slow
  slowTestThreshold: 5000,
};
