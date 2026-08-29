const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/env');
const logger = require('./config/logger');
const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');
const sanitize = require('./middlewares/sanitize');

const app = express();

// ===== TRUST PROXY =====
app.set('trust proxy', 1);

// ===== SECURITY HEADERS =====
app.use(helmet());

// ===== CORS =====
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// ===== BODY PARSER =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== COOKIE PARSER =====
app.use(cookieParser());

// ===== DATA SANITIZATION =====
app.use(sanitize);

// ===== REQUEST LOGGING =====
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ===== SESSION (for captcha only) =====
app.use(
  session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
    },
  })
);

// ===== STATIC FILES =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== RATE LIMITING =====
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ===== API ROUTES =====
app.use('/api/v1', apiRoutes);

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'UniSphere API is running',
    timestamp: new Date().toISOString(),
  });
});

// ===== 404 HANDLER =====
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use(errorHandler);

module.exports = app;
