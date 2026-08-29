const path = require('path');
const fs = require('fs');
const Application = require('../models/application');
const Company = require('../models/Company');
const Internship = require('../models/InternShip');
const Job = require('../models/Jobs');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Get all applications
 *          - Admin: all applications
 *          - User: only their own applications
 * @route   GET /api/v1/applications
 * @access  Private
 */
const getApplications = asyncHandler(async (req, res) => {
  let query = {};

  // Non-admin users can only see their own applications
  if (req.user.role !== 'admin') {
    query.userId = req.user._id;
  }

  const applications = await Application.find(query)
    .populate('jobId', 'title')
    .populate('userId', 'fullname email')
    .sort({ createdAt: -1 });

  return success(res, {
    data: applications,
    message: 'Applications retrieved successfully.',
  });
});

/**
 * @desc    Get single application
 * @route   GET /api/v1/applications/:id
 * @access  Private
 */
const getApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('jobId', 'title description')
    .populate('userId', 'fullname email phone');

  if (!application) {
    return next(
      new AppError('Application not found', 404, `No application with id ${req.params.id}`)
    );
  }

  // Users can only view their own applications (admins can view all)
  if (req.user.role !== 'admin' && application.userId._id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to view this application', 403));
  }

  // Fetch related companies and internships
  const companies = await Company.find({ applicationId: req.params.id });
  const internships = await Internship.find({ applicationId: req.params.id });

  return success(res, {
    data: {
      application,
      companies,
      internships,
    },
    message: 'Application retrieved successfully.',
  });
});

/**
 * @desc    Create new application (with file uploads)
 * @route   POST /api/v1/applications
 * @access  Private
 */
const createApplication = asyncHandler(async (req, res, next) => {
  const {
    jobId,
    fullname,
    adhaar,
    mobileno,
    gender,
    parentstatus,
    fathername,
    mothername,
    gurdianname,
    email,
    category,
    annualincome,
    identificationmark1,
    identificationmark2,
    fulladdress,
    education,
    applicanttype,
    internshipExperience,
    noofinternshipcompanies,
    noofcompaniesworked,
    companies = [],
    internships = [],
  } = req.body;

  // Verify the job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // Process uploaded files
  const uploadedFiles = {};
  if (req.files) {
    for (const fieldName in req.files) {
      const file = req.files[fieldName][0];
      const extension = path.extname(file.originalname);
      const newFileName =
        Date.now() + '_' + req.user._id + '_' + fieldName + extension;
      const oldPath = file.path;
      const newPath = 'uploads/' + newFileName;

      fs.renameSync(oldPath, newPath);
      uploadedFiles[fieldName] = newPath;
    }
  }

  // Create the application
  const newApplication = await Application.create({
    userId: req.user._id,
    jobId,
    fullname,
    adhaar,
    mobileno,
    gender,
    parentstatus,
    fathername,
    mothername,
    gurdianname,
    email,
    category,
    annualincome,
    identificationmark1,
    identificationmark2,
    fulladdress,
    education,
    applicanttype,
    internshipExperience,
    noofinternshipcompanies,
    noofcompaniesworked,
    documents: uploadedFiles,
  });

  // Save companies
  const companyNumbers = parseInt(noofcompaniesworked) || 0;
  for (let i = 0; i < companyNumbers; i++) {
    await Company.create({
      applicationId: newApplication._id,
      userId: req.user._id,
      jobId,
      organization: companies[i]?.organization,
      designation: companies[i]?.designation,
      totalExperience: companies[i]?.totalExperience,
      currentSalary: companies[i]?.currentSalary,
      joiningDate: companies[i]?.joiningDate,
      relievingDate: companies[i]?.relievingDate,
      employmentType: companies[i]?.employmentType,
      location: companies[i]?.location,
      rolesResponsibilities: companies[i]?.rolesResponsibilities,
    });
  }

  // Save internships
  const internshipCount = parseInt(noofinternshipcompanies) || 0;
  for (let i = 0; i < internshipCount; i++) {
    await Internship.create({
      applicationId: newApplication._id,
      userId: req.user._id,
      jobId,
      organization: internships[i]?.organization,
      role: internships[i]?.role,
      duration: internships[i]?.duration,
      stipend: internships[i]?.stipend,
      joiningDate: internships[i]?.joiningDate,
      endingDate: internships[i]?.endingDate,
      skillsLearned: internships[i]?.skillsLearned,
    });
  }

  return success(res, {
    data: newApplication,
    message: 'Application submitted successfully.',
    status: 201,
  });
});

/**
 * @desc    Update application status (admin only)
 * @route   PUT /api/v1/applications/:id/status
 * @access  Private (Admin only)
 */
const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status, adminMessage } = req.body;

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status, adminMessage },
    { new: true, runValidators: true }
  );

  if (!application) {
    return next(
      new AppError('Application not found', 404, `No application with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: application,
    message: 'Application status updated successfully.',
  });
});

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
};
