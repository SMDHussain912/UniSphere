module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  maxWorkers: 1,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'utils/**/*.js',
    'models/**/*.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  forceExit: true,
  testTimeout: 120000,
  setupFiles: ['./tests/setup.js'],
};
