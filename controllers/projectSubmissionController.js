const Project = require('../models/Project');
const ProjectSubmission = require('../models/ProjectSubmission');
const UserSkill = require('../models/UserSkill');
const dockerRunner = require('../utils/dockerRunner');
const { awardPoints } = require('../utils/points');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await ProjectSubmission.find({ userId: req.user.id })
    .populate('projectId', 'title slug difficulty totalPoints')
    .sort({ submittedAt: -1 });
  return success(res, { data: submissions, message: 'Submissions retrieved successfully.' });
});

const getSubmission = asyncHandler(async (req, res, next) => {
  const submission = await ProjectSubmission.findById(req.params.id)
    .populate('projectId', 'title slug difficulty totalPoints testCriteria')
    .populate('reviews.reviewerId', 'fullname email');
  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }
  if (submission.userId.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this submission', 403));
  }
  return success(res, { data: submission, message: 'Submission retrieved successfully.' });
});

const submitProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }
  const { repoUrl, demoUrl, code } = req.body;
  const submission = await ProjectSubmission.create({
    userId: req.user.id,
    projectId: project._id,
    repoUrl: repoUrl || '',
    demoUrl: demoUrl || '',
    code: code || '',
    status: 'submitted',
    maxScore: project.totalPoints,
  });
  return success(res, {
    data: submission,
    message: 'Project submitted successfully.',
    status: 201,
  });
});

const runTests = asyncHandler(async (req, res, next) => {
  const submission = await ProjectSubmission.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }
  const project = await Project.findById(submission.projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }
  submission.status = 'testing';
  await submission.save();
  const results = [];
  let totalScore = 0;
  for (const criteria of project.testCriteria) {
    let passed = false;
    let output = '';
    let points = 0;
    try {
      if (submission.code && criteria.command) {
        const result = await dockerRunner.runCode({ language: 'javascript', code: submission.code });
        output = result.output || '';
        if (criteria.expectedOutput) {
          passed = output.includes(criteria.expectedOutput);
        } else {
          passed = output.length > 0 && !output.toLowerCase().includes('error');
        }
        if (passed) points = criteria.points || 0;
      }
    } catch (_) {
      output = 'Test execution failed';
    }
    results.push({ name: criteria.name, passed, output, points });
    totalScore += points;
  }
  submission.testResults = results;
  submission.score = totalScore;
  submission.status = totalScore >= project.totalPoints * 0.6 ? 'passed' : 'failed';
  submission.testedAt = new Date();
  await submission.save();
  if (submission.status === 'passed') {
    for (const skillKey of project.skillKeys) {
      let userSkill = await UserSkill.findOne({ userId: req.user.id, skillKey });
      if (!userSkill) {
        userSkill = await UserSkill.create({ userId: req.user.id, skillKey, evidence: [] });
      }
      userSkill.evidence.push({
        type: 'project',
        title: `Completed project: ${project.title}`,
        description: `Scored ${totalScore}/${project.totalPoints} on automated tests`,
        score: Math.round((totalScore / project.totalPoints) * 100),
        count: 1,
        earnedPoints: totalScore,
      });
      const evidence = userSkill.evidence;
      const total = evidence.reduce((sum, e) => {
        let contribution = (e.type === 'course_completed' ? 25 : e.type === 'project' ? 20 : 5) * (e.count || 1);
        if (e.score !== null) contribution = contribution * (e.score / 100);
        return sum + contribution;
      }, 0);
      userSkill.level = Math.min(100, Math.round(total));
      const types = new Set(evidence.map((e) => e.type));
      const hasProject = evidence.some((e) => e.type === 'project');
      userSkill.verified = evidence.length >= 3 && types.size >= 2 && hasProject;
      if (userSkill.verified && !userSkill.verifiedAt) userSkill.verifiedAt = new Date();
      await userSkill.save();
    }
    await awardPoints(req.user.id, totalScore, `project passed: ${project.slug}`, 'learningPoints');
  }
  return success(res, {
    data: { submission, passed: submission.status === 'passed', score: totalScore, maxScore: project.totalPoints },
    message: submission.status === 'passed' ? 'Congratulations! All tests passed.' : 'Some tests failed. Review and resubmit.',
  });
});

const addReview = asyncHandler(async (req, res, next) => {
  const submission = await ProjectSubmission.findById(req.params.id);
  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }
  if (submission.userId.toString() === req.user.id) {
    return next(new AppError('You cannot review your own submission', 400));
  }
  const { rating, feedback } = req.body;
  const existingIdx = submission.reviews.findIndex((r) => r.reviewerId.toString() === req.user.id);
  if (existingIdx >= 0) {
    submission.reviews[existingIdx].rating = rating;
    submission.reviews[existingIdx].feedback = feedback || '';
  } else {
    submission.reviews.push({ reviewerId: req.user.id, rating, feedback: feedback || '' });
  }
  if (submission.status === 'passed') submission.status = 'reviewed';
  await submission.save();
  return success(res, { data: submission, message: 'Review added successfully.' });
});

const getProjectSubmissions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { projectId: req.params.id };
  if (status) query.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [submissions, total] = await Promise.all([
    ProjectSubmission.find(query).populate('userId', 'fullname email').sort({ score: -1 }).skip(skip).limit(parseInt(limit)),
    ProjectSubmission.countDocuments(query),
  ]);
  return success(res, {
    data: { submissions, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalItems: total, itemsPerPage: parseInt(limit) } },
    message: 'Project submissions retrieved successfully.',
  });
});

module.exports = {
  getMySubmissions,
  getSubmission,
  submitProject,
  runTests,
  addReview,
  getProjectSubmissions,
};
