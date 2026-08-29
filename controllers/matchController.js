const Job = require('../models/Jobs');
const JobRequirement = require('../models/JobRequirement');
const UserSkill = require('../models/UserSkill');
const CourseProgress = require('../models/CourseProgress');
const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');

const calculateMatch = (userSkills, requirements) => {
  if (!requirements || requirements.length === 0) {
    return { percentage: 0, gaps: [], met: [], totalWeight: 0, earnedWeight: 0 };
  }
  let totalWeight = 0;
  let earnedWeight = 0;
  const gaps = [];
  const met = [];
  requirements.forEach((req) => {
    const weight = (req.importance || 1) * (req.minimumLevel / 100);
    totalWeight += weight;
    const userSkill = userSkills.find((us) => us.skillKey === req.skillKey);
    const userLevel = userSkill ? userSkill.level : 0;
    if (userLevel >= req.minimumLevel) {
      earnedWeight += weight;
      met.push({ skillKey: req.skillKey, required: req.minimumLevel, actual: userLevel, importance: req.importance });
    } else {
      const contribution = (userLevel / req.minimumLevel) * weight;
      earnedWeight += contribution;
      gaps.push({ skillKey: req.skillKey, required: req.minimumLevel, actual: userLevel, gap: req.minimumLevel - userLevel, importance: req.importance });
    }
  });
  const percentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  gaps.sort((a, b) => b.gap * b.importance - a.gap * a.importance);
  return { percentage, gaps, met, totalWeight, earnedWeight };
};

const getMatchForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ status: 'error', message: 'Job not found' });
  const requirements = await JobRequirement.find({ jobId: job._id });
  const userSkills = await UserSkill.find({ userId: req.user.id }).select('skillKey level');
  const match = calculateMatch(userSkills, requirements);
  const gapRecommendations = await Promise.all(match.gaps.map(async (gap) => {
    const enrollments = await CourseProgress.find({ userId: req.user.id }).distinct('courseSlug');
    return { ...gap, recommendedAction: `Improve ${gap.skillKey} from ${gap.actual}% to ${gap.minimumLevel}%`, currentEnrollments: enrollments.length };
  }));
  return success(res, {
    data: {
      job: { id: job._id, title: job.title, organization: job.organization },
      matchPercentage: match.percentage,
      gaps: gapRecommendations,
      met: match.met,
      requirements: requirements.map((r) => ({ skillKey: r.skillKey, minimumLevel: r.minimumLevel, importance: r.importance })),
    },
    message: 'Match calculated successfully.',
  });
});

const getAllMatches = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ status: 'Active' });
  const userSkills = await UserSkill.find({ userId: req.user.id }).select('skillKey level');
  const results = await Promise.all(jobs.map(async (job) => {
    const requirements = await JobRequirement.find({ jobId: job._id });
    const match = calculateMatch(userSkills, requirements);
    return {
      job: { id: job._id, title: job.title, organization: job.organization, location: job.location, salary: job.salary, employmentType: job.employmentType },
      matchPercentage: match.percentage,
      gapCount: match.gaps.length,
      topGap: match.gaps.length > 0 ? match.gaps[0] : null,
    };
  }));
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return success(res, { data: { matches: results }, message: 'All job matches retrieved successfully.' });
});

const getCandidatesForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ status: 'error', message: 'Job not found' });
  const requirements = await JobRequirement.find({ jobId: job._id });
  if (requirements.length === 0) return success(res, { data: { candidates: [] }, message: 'No requirements set for this job.' });
  const userSkills = await UserSkill.find().select('userId skillKey level');
  const userMap = new Map();
  userSkills.forEach((us) => {
    if (!userMap.has(us.userId.toString())) userMap.set(us.userId.toString(), []);
    userMap.get(us.userId.toString()).push({ skillKey: us.skillKey, level: us.level });
  });
  const candidates = [];
  userMap.forEach((skills, userId) => {
    const match = calculateMatch(skills, requirements);
    candidates.push({ userId, matchPercentage: match.percentage, gapCount: match.gaps.length });
  });
  candidates.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return success(res, { data: { job: { id: job._id, title: job.title }, candidates: candidates.slice(0, 50) }, message: 'Candidates ranked successfully.' });
});

const addRequirement = asyncHandler(async (req, res, next) => {
  const { skillKey, minimumLevel, importance } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job) return next(new (require('../utils/AppError'))('Job not found', 404));
  const existing = await JobRequirement.findOne({ jobId: job._id, skillKey: skillKey.toLowerCase() });
  if (existing) {
    existing.minimumLevel = minimumLevel || 30;
    existing.importance = importance || 1;
    await existing.save();
    return success(res, { data: existing, message: 'Requirement updated successfully.' });
  }
  const requirement = await JobRequirement.create({ jobId: job._id, skillKey: skillKey.toLowerCase(), minimumLevel: minimumLevel || 30, importance: importance || 1 });
  return success(res, { data: requirement, message: 'Requirement added successfully.', status: 201 });
});

const removeRequirement = asyncHandler(async (req, res, next) => {
  const requirement = await JobRequirement.findOneAndDelete({ jobId: req.params.id, skillKey: req.params.skillKey });
  if (!requirement) return next(new (require('../utils/AppError'))('Requirement not found', 404));
  return success(res, { data: requirement, message: 'Requirement removed successfully.' });
});

module.exports = { calculateMatch, getMatchForJob, getAllMatches, getCandidatesForJob, addRequirement, removeRequirement };
