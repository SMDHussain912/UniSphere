const UserSkill = require('../models/UserSkill');
const SkillNode = require('../models/SkillNode');
const skillGraph = require('../utils/skillGraph');
const { awardPoints } = require('../utils/points');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const EVIDENCE_WEIGHTS = {
  course_completed: 25,
  certification: 20,
  project: 20,
  assessment: 15,
  exercise: 5,
  external: 10,
};

const computeLevel = (evidenceList) => {
  if (!evidenceList || evidenceList.length === 0) return 0;
  let total = 0;
  evidenceList.forEach((e) => {
    const weight = EVIDENCE_WEIGHTS[e.type] || 5;
    let contribution = weight * (e.count || 1);
    if (e.score !== null && e.score !== undefined) {
      contribution = contribution * (e.score / 100);
    }
    total += contribution;
  });
  return Math.min(100, Math.round(total));
};

const computeVerified = (evidenceList) => {
  if (!evidenceList || evidenceList.length < 3) return false;
  const types = new Set(evidenceList.map((e) => e.type));
  if (types.size < 2) return false;
  const hasProject = evidenceList.some((e) => e.type === 'project');
  const hasAssessment = evidenceList.some((e) => e.type === 'assessment');
  return hasProject || hasAssessment;
};

const getMySkills = asyncHandler(async (req, res) => {
  const skills = await UserSkill.find({ userId: req.user.id })
    .populate('skillKey', 'name category')
    .sort({ level: -1 })
    .lean();

  const enriched = await Promise.all(
    skills.map(async (s) => {
      const node = await SkillNode.findOne({ key: s.skillKey }).lean();
      return { ...s, skill: node };
    })
  );

  return success(res, { data: { skills: enriched }, message: 'Your skills retrieved successfully.' });
});

const addEvidence = asyncHandler(async (req, res, next) => {
  const skillKey = req.params.key.toLowerCase();
  const node = await SkillNode.findOne({ key: skillKey });
  if (!node) {
    return next(new AppError('Skill not found', 404));
  }

  const { type, title, description, source, sourceUrl, score, count } = req.body;

  let userSkill = await UserSkill.findOne({ userId: req.user.id, skillKey });
  if (!userSkill) {
    userSkill = await UserSkill.create({
      userId: req.user.id,
      skillKey,
      evidence: [],
    });
  }

  const evidence = {
    type,
    title,
    description: description || '',
    source: source || '',
    sourceUrl: sourceUrl || '',
    score: score !== undefined ? Number(score) : null,
    count: count !== undefined ? Number(count) : 1,
  };

  const basePoints = EVIDENCE_WEIGHTS[type] || 5;
  evidence.earnedPoints = basePoints * (evidence.count || 1);

  userSkill.evidence.push(evidence);
  userSkill.level = computeLevel(userSkill.evidence);
  userSkill.verified = computeVerified(userSkill.evidence);
  userSkill.lastActivityAt = new Date();

  if (userSkill.verified && !userSkill.verifiedAt) {
    userSkill.verifiedAt = new Date();
  }

  await userSkill.save();

  if (evidence.earnedPoints > 0) {
    await awardPoints(req.user.id, evidence.earnedPoints, `evidence for ${skillKey}`, 'learningPoints');
  }

  return success(res, {
    data: { skill: userSkill, pointsAwarded: evidence.earnedPoints },
    message: 'Evidence added successfully.',
    status: 201,
  });
});

const getMySkillDetail = asyncHandler(async (req, res, next) => {
  const skillKey = req.params.key.toLowerCase();
  const node = await SkillNode.findOne({ key: skillKey }).lean();
  if (!node) {
    return next(new AppError('Skill not found', 404));
  }
  const userSkill = await UserSkill.findOne({ userId: req.user.id, skillKey }).lean();
  const children = await SkillNode.find({ parentKey: skillKey }).sort({ order: 1 }).lean();

  return success(res, {
    data: { skill: node, progress: userSkill || null, children },
    message: 'Skill progress retrieved successfully.',
  });
});

const removeEvidence = asyncHandler(async (req, res, next) => {
  const skillKey = req.params.key.toLowerCase();
  const evidenceId = req.params.evidenceId;

  const userSkill = await UserSkill.findOne({ userId: req.user.id, skillKey });
  if (!userSkill) {
    return next(new AppError('Skill not found', 404));
  }

  const idx = userSkill.evidence.findIndex((e) => e._id.toString() === evidenceId);
  if (idx === -1) {
    return next(new AppError('Evidence not found', 404));
  }

  userSkill.evidence.splice(idx, 1);
  userSkill.level = computeLevel(userSkill.evidence);
  userSkill.verified = computeVerified(userSkill.evidence);
  userSkill.lastActivityAt = new Date();

  if (!userSkill.verified) {
    userSkill.verifiedAt = null;
  }

  await userSkill.save();

  return success(res, {
    data: { skill: userSkill },
    message: 'Evidence removed successfully.',
  });
});

module.exports = {
  getMySkills,
  addEvidence,
  getMySkillDetail,
  removeEvidence,
  computeLevel,
  computeVerified,
};