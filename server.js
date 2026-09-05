const config = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/database');
const courseLoader = require('./utils/courseLoader');
const app = require('./app');
const { initTerminalGateway } = require('./utils/terminalGateway');
const { cleanupExpiredSessions } = require('./controllers/labSessionController');

// Connect to database
connectDB();

// Load and watch the course catalog
courseLoader.init();

const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

initTerminalGateway(server);

// Periodic cleanup of expired lab sessions (every 60 seconds)
const CLEANUP_INTERVAL_MS = 60000;
const cleanupTimer = setInterval(async () => {
  try {
    const count = await cleanupExpiredSessions();
    if (count > 0) {
      logger.info(`Cleaned up ${count} expired lab session(s)`);
    }
  } catch (err) {
    logger.error(`Session cleanup error: ${err.message}`);
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref(); // don't prevent process exit

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  clearInterval(cleanupTimer);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // Force exit if connections remain after timeout
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
