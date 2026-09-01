const dotenv = require('dotenv');
dotenv.config();

const requiredEnvVars = [
  'MONGO_URL',
  'JWT_SECRET',
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
    'Please create a .env file with the required variables.'
  );
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  labMaxSessions: parseInt(process.env.LAB_MAX_SESSIONS) || 2,
  runConcurrency: parseInt(process.env.RUN_CONCURRENCY) || 2,
  labSessionTtlMinutes: parseInt(process.env.LAB_SESSION_TTL_MINUTES) || 30,
  labMemoryLimitMb: parseInt(process.env.LAB_MEMORY_LIMIT_MB) || 256,
  runTimeoutMs: parseInt(process.env.RUN_TIMEOUT_MS) || 10000,
  labEnabled: process.env.LAB_ENABLED !== 'false',
  terminalEnabled: process.env.TERMINAL_ENABLED !== 'false',
  dockerSocket: process.env.DOCKER_HOST || undefined,
};
