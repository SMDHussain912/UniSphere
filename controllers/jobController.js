const Job = require('../models/Jobs');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Get all jobs
 * @route   GET /api/v1/jobs
 * @access  Public
 */
const getJobs = asyncHandler(async (req, res) => {
  const { search, category, employmentType, status, page = 1, limit = 10 } =
    req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }
  if (category && category !== 'all') query.category = category;
  if (employmentType && employmentType !== 'all') query.employmentType = employmentType;
  if (status && status !== 'all') query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Job.countDocuments(query),
  ]);

  return success(res, {
    data: {
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
    message: 'Job listings retrieved successfully.',
  });
});

/**
 * @desc    Get single job
 * @route   GET /api/v1/jobs/:id
 * @access  Public
 */
const getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(
      new AppError('Job not found', 404, `No job exists with id ${req.params.id}`)
    );
  }

  return success(res, { data: job });
});

/**
 * @desc    Create new job
 * @route   POST /api/v1/jobs
 * @access  Private (Admin only)
 */
const createJob = asyncHandler(async (req, res, next) => {
  // Find the last job to generate a sequential ID
  const lastJob = await Job.findOne().sort({ id: -1 });
  const newId = lastJob ? lastJob.id + 1 : 1;

  const job = await Job.create({
    id: newId,
    ...req.body,
  });

  return success(res, {
    data: job,
    message: 'Job created successfully.',
    status: 201,
  });
});

/**
 * @desc    Update job
 * @route   PUT /api/v1/jobs/:id
 * @access  Private (Admin only)
 */
const updateJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    return next(
      new AppError('Job not found', 404, `No job exists with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: job,
    message: 'Job updated successfully.',
  });
});

/**
 * @desc    Delete job
 * @route   DELETE /api/v1/jobs/:id
 * @access  Private (Admin only)
 */
const deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    return next(
      new AppError('Job not found', 404, `No job exists with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: job,
    message: 'Job deleted successfully.',
  });
});

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
