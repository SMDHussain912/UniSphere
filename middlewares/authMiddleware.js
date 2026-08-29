const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const ADMIN_ROLES = [
  'admin',
  'exam_admin',
  'question_admin',
  'hallticket_admin',
  'grader_admin',
  'superadmin',
];

const authenticate = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const currentUser = await User.findById(decoded.id).select('+role');

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    if (currentUser.active === false) {
      return next(
        new AppError(
          'This account has been deactivated. Contact the super admin.',
          403
        )
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }
    const allowed = roles.includes('superadmin')
      ? [req.user.role === 'superadmin', roles.includes(req.user.role)].some(Boolean)
      : roles.includes(req.user.role) || req.user.role === 'superadmin';
    if (!allowed) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }
  next();
};

module.exports = { authenticate, authorize, authorizeAdmin, ADMIN_ROLES };
