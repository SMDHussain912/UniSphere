const User = require('../models/User');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

const PLANS = {
  free: { name: 'Free', price: 0, features: ['Basic learning', 'Limited practice', 'Community access', 'Basic job board'] },
  pro: { name: 'Pro', price: 15, features: ['Unlimited learning', 'Advanced labs', 'AI mentor', 'Advanced assessments', 'Skill analytics', 'Projects'] },
  company: { name: 'Company', price: 99, features: ['Job postings', 'Candidate search', 'Technical assessments', 'Applicant screening', 'Skill-based matching'] },
};

const getPlans = asyncHandler(async (req, res) => {
  success(res, { data: PLANS });
});

const getMySubscription = asyncHandler(async (req, res) => {
  const user = req.user;
  const plan = PLANS[user.plan] || PLANS.free;
  success(res, {
    data: {
      plan: user.plan,
      planName: plan.name,
      features: plan.features,
      expiresAt: user.planExpiresAt,
      limits: user.planLimits || user.resolveLimits(),
      isActive: !user.planExpiresAt || user.planExpiresAt > new Date(),
    },
  });
});

const subscribe = asyncHandler(async (req, res, next) => {
  const { plan, months = 1 } = req.body;
  if (!PLANS[plan] || plan === 'free') {
    return next(new AppError('Invalid plan selected', 400));
  }
  const user = await User.findById(req.user._id);
  if (user.plan === plan && user.planExpiresAt > new Date()) {
    user.planExpiresAt = new Date(user.planExpiresAt.getTime() + months * 30 * 24 * 60 * 60 * 1000);
  } else {
    user.plan = plan;
    user.planExpiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  }
  user.resolveLimits();
  await user.save();
  success(res, { data: { plan: user.plan, expiresAt: user.planExpiresAt, limits: user.planLimits }, message: `Subscribed to ${PLANS[plan].name}` });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.plan = 'free';
  user.planExpiresAt = null;
  user.resolveLimits();
  await user.save();
  success(res, { data: { plan: 'free', limits: user.planLimits }, message: 'Subscription cancelled' });
});

const checkFeatureAccess = asyncHandler(async (req, res) => {
  const { feature } = req.params;
  const user = req.user;
  const limits = user.planLimits || user.resolveLimits();
  const access = {
    labSessions: user.hasPlan('pro') && limits.labSessions > 0,
    advancedLabs: user.hasPlan('pro'),
    aiMentor: user.hasPlan('pro'),
    advancedAnalytics: limits.advancedAnalytics,
    projects: user.hasPlan(['pro', 'free']),
    jobPosting: user.hasPlan('company'),
    candidateSearch: user.hasPlan('company'),
  };
  success(res, { data: { feature, allowed: access[feature] || false, plan: user.plan } });
});

module.exports = { getPlans, getMySubscription, subscribe, cancelSubscription, checkFeatureAccess, PLANS };
