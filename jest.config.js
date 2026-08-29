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
  testTimeout: 90000,
  hookTimeout: 90000,
  setupFiles: ['./tests/setup.js'],
};
