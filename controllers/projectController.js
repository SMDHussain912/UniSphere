const Project = require('../models/Project');
const ProjectSubmission = require('../models/ProjectSubmission');
const UserSkill = require('../models/UserSkill');
const { awardPoints } = require('../utils/points');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const getProjects = asyncHandler(async (req, res) => {
  const { skillKey, difficulty, page = 1, limit = 20, q } = req.query;
  const query = { isPublished: true };
  if (skillKey) query.skillKeys = skillKey.toLowerCase();
  if (difficulty) query.difficulty = difficulty;
  if (q) query.title = { $regex: q, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [projects, total] = await Promise.all([
    Project.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Project.countDocuments(query),
  ]);

  return success(res, {
    data: {
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
    message: 'Projects retrieved successfully.',
  });
});

const getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) {
    return next(new AppError('Project not found', 404));
  }
  return success(res, { data: project, message: 'Project retrieved successfully.' });
});

const createProject = asyncHandler(async (req, res, next) => {
  const { title, slug, description, difficulty, skillKeys, starterCode, starterRepoUrl, testCriteria, estimatedHours } = req.body;

  const existing = await Project.findOne({ slug });
  if (existing) {
    return next(new AppError('A project with this slug already exists', 400));
  }

  const totalPoints = (testCriteria || []).reduce((sum, tc) => sum + (tc.points || 0), 0);

  const project = await Project.create({
    title,
    slug,
    description,
    difficulty,
    skillKeys: (skillKeys || []).map((k) => k.toLowerCase()),
    starterCode: starterCode || '',
    starterRepoUrl: starterRepoUrl || '',
    testCriteria: testCriteria || [],
    totalPoints,
    estimatedHours: estimatedHours || 1,
    createdBy: req.user.id,
  });

  return success(res, { data: project, message: 'Project created successfully.', status: 201 });
});

const updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const { title, description, difficulty, skillKeys, starterCode, starterRepoUrl, testCriteria, estimatedHours, isPublished } = req.body;

  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (difficulty !== undefined) project.difficulty = difficulty;
  if (skillKeys !== undefined) project.skillKeys = skillKeys.map((k) => k.toLowerCase());
  if (starterCode !== undefined) project.starterCode = starterCode;
  if (starterRepoUrl !== undefined) project.starterRepoUrl = starterRepoUrl;
  if (testCriteria !== undefined) {
    project.testCriteria = testCriteria;
    project.totalPoints = testCriteria.reduce((sum, tc) => sum + (tc.points || 0), 0);
  }
  if (estimatedHours !== undefined) project.estimatedHours = estimatedHours;
  if (isPublished !== undefined) project.isPublished = isPublished;

  await project.save();
  return success(res, { data: project, message: 'Project updated successfully.' });
});

const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }
  return success(res, { data: project, message: 'Project deleted successfully.' });
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};