const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// Stricter limit for code execution: 30 runs per minute per user/IP
const runCodeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    status: 'error',
    message: 'Too many code executions. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
});

// Limit for lab session creation: 5 per minute
const labSessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    message: 'Too many lab session requests. Please wait.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
});

module.exports = { runCodeLimiter, labSessionLimiter };
