const AppError = require('../utils/AppError');

const requirePlan = (plans) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (!req.user.hasPlan(plans)) {
    const needed = Array.isArray(plans) ? plans.join(' or ') : plans;
    return next(new AppError(`This feature requires a ${needed} plan. Upgrade to continue.`, 403));
  }
  next();
};

const planLimits = (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (!req.user.planLimits) req.user.resolveLimits();
  res.locals.limits = req.user.planLimits;
  res.locals.plan = req.user.plan;
  next();
};

module.exports = { requirePlan, planLimits };
