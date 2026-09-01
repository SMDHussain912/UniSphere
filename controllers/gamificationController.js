const { UserLevel, LEVEL_THRESHOLDS } = require('../models/UserLevel');
const { Achievement, ACHIEVEMENTS } = require('../models/Achievement');
const User = require('../models/User');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const { awardPoints } = require('../utils/points');
const ProjectSubmission = require('../models/ProjectSubmission');
const Profile = require('../models/Profile');
const UserSkill = require('../models/UserSkill');

const awardXp = async (userId, amount, reason = '') => {
  const xp = Math.trunc(amount);
  if (!xp || xp <= 0) return null;
  const level = await UserLevel.findOneAndUpdate(
    { userId },
    { $inc: { xp: xp } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const computed = UserLevel.computeLevel(level.xp);
  if (level.level !== computed.level) {
    level.level = computed.level;
    level.levelName = computed.levelName;
    await level.save();
  }
  return { xp: level.xp, level: level.level, levelName: level.levelName };
};

const awardXpBySkill = async (userId, skillKey, amount) => {
  const level = await UserLevel.findOneAndUpdate(
    { userId },
    { $inc: { [`perSkillXp.${skillKey}`]: amount } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return level.perSkillXp.get(skillKey) || 0;
};

const awardAchievement = async (userId, key, metadata = {}) => {
  const def = ACHIEVEMENTS.find((a) => a.key === key);
  if (!def) return null;
  try {
    await Achievement.create({ userId, ...def, metadata });
    await awardPoints(userId, 50, `achievement: ${def.name}`);
  } catch (e) {
    if (e.code !== 11000) throw e;
  }
  return null;
};

const checkAchievements = async (userId) => {
  const [user, level, projectSubmissions, examResults, achievements] = await Promise.all([
    User.findById(userId),
    UserLevel.findOne({ userId }),
    ProjectSubmission.countDocuments({ userId, status: 'passed' }),
    require('../models/ExamResult').countDocuments({ userId, status: 'Passed' }),
    Achievement.find({ userId }),
  ]);
  const earned = new Set(achievements.map((a) => a.key));
  const toAward = [];
  if (projectSubmissions >= 1 && !earned.has('first_project')) toAward.push('first_project');
  if (projectSubmissions >= 5 && !earned.has('project_5')) toAward.push('project_5');
  if (projectSubmissions >= 20 && !earned.has('project_20')) toAward.push('project_20');
  if (examResults >= 1 && !earned.has('first_assessment')) toAward.push('first_assessment');
  if (level && level.xp >= 200 && !earned.has('level_2')) toAward.push('level_2');
  if (level && level.xp >= 1500 && !earned.has('level_3')) toAward.push('level_3');
  if (level && level.xp >= 3000 && !earned.has('level_5')) toAward.push('level_5');
  for (const key of toAward) {
    await awardAchievement(userId, key);
  }
    return toAward;
};

const getUserLevel = asyncHandler(async (req, res) => {
  const level = await UserLevel.findOne({ userId: req.user.id });
  if (!level) {
    return success(res, { data: { xp: 0, level: 0, levelName: 'Novice', perSkill: {}, nextLevelXp: 200, progress: 0 } });
  }
  const nextThreshold = LEVEL_THRESHOLDS[level.level + 1];
  const nextXp = nextThreshold ? nextThreshold.xpRequired - level.xp : 0;
  const progress = nextThreshold
    ? Math.round((level.xp - LEVEL_THRESHOLDS[level.level].xpRequired) / (nextThreshold.xpRequired - LEVEL_THRESHOLDS[level.level].xpRequired) * 100)
    : 100;
  return success(res, {
    data: {
      xp: level.xp,
      level: level.level,
      levelName: level.levelName,
      perSkill: level.perSkillXp || {},
      nextLevelXp: nextXp || 0,
      progress: Math.min(100, Math.max(0, progress)),
    },
  });
});

const getUserAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find({ userId: req.user.id }).sort('-earnedAt');
  return success(res, { data: achievements });
});

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(req.query.limit || 50, 200);
  const users = await User.find({ active: true })
    .sort('-learningPoints')
    .limit(limit)
    .select('fullname learningPoints points badges role createdAt');
  return success(res, { data: users });
});

const getPerSkillLeaderboard = asyncHandler(async (req, res) => {
  const { skillKey } = req.params;
  const limit = Math.min(req.query.limit || 50, 200);
  const levels = await UserLevel.find({})
    .sort(`-perSkillXp.${skillKey}`)
    .limit(limit)
    .populate('userId', 'fullname learningPoints points')
    .select('-__v');
  const ranked = levels
    .filter((l) => (l.perSkillXp.get(skillKey) || 0) > 0)
    .map((l, i) => ({
      rank: i + 1,
      user: l.userId,
      xp: l.perSkillXp.get(skillKey),
    }));
  return success(res, { data: ranked });
});

const getPortfolio = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  const [user, profile, level, userSkills, submissions, achievements] = await Promise.all([
    User.findById(userId).select('fullname email learningPoints points badges role createdAt'),
    Profile.findOne({ userId }),
    UserLevel.findOne({ userId }),
    UserSkill.find({ userId, verified: true }),
    ProjectSubmission.find({ userId, status: 'passed' })
      .populate('projectId', 'title slug difficulty skillKeys totalPoints')
      .sort('-updatedAt')
      .limit(20),
    Achievement.find({ userId }).sort('-earnedAt'),
  ]);
  if (!user) return next(new AppError('User not found', 404));
  const verifiedSkills = userSkills
    .map((s) => ({ skillKey: s.skillKey, level: s.level, evidenceCount: s.evidence.length }))
    .filter((s) => s.level >= 60);
  return success(res, {
    data: {
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        memberSince: user.createdAt,
      },
      profile,
      stats: {
        learningPoints: user.learningPoints,
        totalXp: level?.xp || 0,
        level: level?.level || 0,
        levelName: level?.levelName || 'Novice',
        badges: user.badges,
        verifiedSkills,
        projectsCompleted: submissions.length,
        achievements: achievements.length,
      },
      projects: submissions.map((s) => ({
        title: s.projectId?.title,
        slug: s.projectId?.slug,
        difficulty: s.projectId?.difficulty,
        skills: s.projectId?.skillKeys || [],
        score: s.score || 0,
        totalPoints: s.projectId?.totalPoints || 0,
        submittedAt: s.createdAt,
      })),
      achievements: achievements.slice(0, 12),
      skillEvidence: userSkills.map((s) => ({
        skillKey: s.skillKey,
        level: s.level,
        verified: s.verified,
        evidenceCount: s.evidence.length,
      })),
    },
  });
});

module.exports = {
  awardXp,
  awardXpBySkill,
  awardAchievement,
  checkAchievements,
  getUserLevel,
  getUserAchievements,
  getGlobalLeaderboard,
  getPerSkillLeaderboard,
  getPortfolio,
};
