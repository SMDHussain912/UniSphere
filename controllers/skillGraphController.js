const SkillNode = require('../models/SkillNode');
const skillGraph = require('../utils/skillGraph');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const getGraph = asyncHandler(async (req, res) => {
  const tree = skillGraph.getTree();
  return success(res, { data: { tree }, message: 'Skill graph retrieved successfully.' });
});

const getSkillDetail = asyncHandler(async (req, res, next) => {
  const key = req.params.key.toLowerCase();
  const node = await SkillNode.findOne({ key }).lean();
  if (!node) {
    return next(new AppError('Skill not found', 404));
  }
  const children = await SkillNode.find({ parentKey: key }).sort({ order: 1 }).lean();
  let parent = null;
  if (node.parentKey) {
    parent = await SkillNode.findOne({ key: node.parentKey }).lean();
  }
  return success(res, {
    data: { skill: node, parent, children },
    message: 'Skill detail retrieved successfully.',
  });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const UserSkill = require('../models/UserSkill');
  const mySkills = await UserSkill.find({ userId: req.user.id }).select('skillKey level').lean();
  const myKeys = new Set(mySkills.map((s) => s.skillKey));

  const allNodes = await SkillNode.find().lean();
  const recommendations = [];

  allNodes.forEach((node) => {
    if (myKeys.has(node.key)) return;
    if (!node.parentKey) return;
    if (myKeys.has(node.parentKey)) {
      recommendations.push({
        skill: node,
        reason: `You know ${node.parentKey}. This is the next step.`,
        priority: 1,
      });
    }
  });

  return success(res, {
    data: { recommendations },
    message: 'Recommendations retrieved successfully.',
  });
});

module.exports = {
  getGraph,
  getSkillDetail,
  getRecommendations,
};