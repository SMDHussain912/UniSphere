const User = require('../models/User');
const logger = require('../config/logger');

const awardPoints = async (userId, amount, reason = '', field = 'points') => {
  const points = Math.trunc(amount);
  if (!points || points <= 0) return 0;

  const update = { $inc: {} };
  update.$inc[field] = points;

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select(
    `points ${field}`
  );

  if (user) {
    logger.info(`Awarded ${points} ${field} to user ${userId} (${reason})`);
  }

  return user ? user[field] : 0;
};

const awardBadge = async (userId, badge) => {
  if (!badge) return null;
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { badges: badge } },
    { new: true }
  ).select('badges');
  if (user && user.badges.includes(badge)) {
    logger.info(`Awarded badge "${badge}" to user ${userId}`);
  }
  return user ? user.badges : [];
};

const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId).select('points badges learningPoints');
  if (!user) return;

  const newBadges = [];
  if (user.points >= 100 && !user.badges.includes('centurion')) newBadges.push('centurion');
  if (user.points >= 500 && !user.badges.includes('achiever')) newBadges.push('achiever');
  if (user.points >= 1000 && !user.badges.includes('elite')) newBadges.push('elite');
  if (user.learningPoints >= 200 && !user.badges.includes('scholar')) newBadges.push('scholar');

  if (newBadges.length > 0) {
    await User.findByIdAndUpdate(userId, { $addToSet: { badges: { $each: newBadges } } });
    logger.info(`Awarded badges ${newBadges.join(', ')} to user ${userId}`);
  }
};

module.exports = { awardPoints, awardBadge, checkAndAwardBadges };