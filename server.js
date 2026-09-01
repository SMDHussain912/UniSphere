const config = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/database');
const courseLoader = require('./utils/courseLoader');
const app = require('./app');
const { initTerminalGateway } = require('./utils/terminalGateway');

// Connect to database
connectDB();

// Load and watch the course catalog
courseLoader.init();

const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

initTerminalGateway(server);

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
