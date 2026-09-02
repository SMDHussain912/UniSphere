const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const Job = require('../models/Jobs');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

const searchCandidates = asyncHandler(async (req, res) => {
  const { skill, minLevel, page = 1, limit = 20 } = req.query;
  const query = { role: 'user', active: true };
  let skillFilter = {};
  if (skill) {
    skillFilter = { skillKey: skill };
    if (minLevel) skillFilter.level = { $gte: parseInt(minLevel) };
  }
  if (skill) {
    const userSkills = await UserSkill.find(skillFilter).select('userId');
    const userIds = userSkills.map((s) => s.userId);
    query._id = { $in: userIds };
  }
  const total = await User.countDocuments(query);
  const candidates = await User.find(query)
    .select('fullname email plan')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  const results = await Promise.all(candidates.map(async (u) => {
    const skills = await UserSkill.find({ userId: u._id }).sort({ level: -1 }).limit(5);
    return {
      id: u._id,
      name: (u.fullname?.firstname || '') + ' ' + (u.fullname?.lastname || ''),
      plan: u.plan,
      skills: skills.map((s) => ({ key: s.skillKey, level: s.level, verified: s.verified })),
    };
  }));
  success(res, { data: { candidates: results, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalItems: total } } });
});

const getCompanyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('companyProfile plan');
  success(res, { data: { companyProfile: user.companyProfile, plan: user.plan } });
});

const updateCompanyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.companyProfile = { ...user.companyProfile, ...req.body };
  await user.save();
  success(res, { data: user.companyProfile, message: 'Company profile updated' });
});

const postJob = asyncHandler(async (req, res, next) => {
  const job = await Job.create({ ...req.body, organization: req.user.companyProfile?.companyName || 'UniSphere', postedBy: req.user._id });
  success(res, { data: job, message: 'Job posted successfully' }, 201);
});

const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  success(res, { data: jobs });
});

module.exports = { searchCandidates, getCompanyProfile, updateCompanyProfile, postJob, getMyJobs };
