const Application = require('../models/application');
const Company = require('../models/Company');
const Internship = require('../models/InternShip');
const User = require('../models/User');
const Job = require('../models/Jobs');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const ExamEnrollment = require('../models/ExamEnrollment');
const HallTicket = require('../models/HallTicket');
const AnswerSheet = require('../models/AnswerSheet');
const QuestionPaper = require('../models/QuestionPaper');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
    totalExams,
    totalExamAttempts,
    passedExams,
    failedExams,
    totalEnrollments,
    confirmedEnrollments,
    hallTicketsIssued,
    pendingAnswerSheets,
    totalPapers,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Job.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({ status: 'pending' }),
    Application.countDocuments({ status: 'accepted' }),
    Application.countDocuments({ status: 'rejected' }),
    Exam.countDocuments(),
    ExamResult.countDocuments(),
    ExamResult.countDocuments({ status: 'Passed' }),
    ExamResult.countDocuments({ status: 'Failed' }),
    ExamEnrollment.countDocuments(),
    ExamEnrollment.countDocuments({ status: 'confirmed' }),
    HallTicket.countDocuments(),
    AnswerSheet.countDocuments({ status: 'pending' }),
    QuestionPaper.countDocuments(),
  ]);

  return success(res, {
    data: {
      totalUsers,
      totalJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalExams,
      totalExamAttempts,
      passedExams,
      failedExams,
      totalEnrollments,
      confirmedEnrollments,
      hallTicketsIssued,
      pendingAnswerSheets,
      totalPapers,
    },
    message: 'Dashboard statistics retrieved successfully.',
  });
});

const getAdminExamResults = asyncHandler(async (req, res) => {
  const { status, examId, page = 1, limit = 10 } = req.query;

  const query = {};

  if (status && status !== 'all') query.status = status;
  if (examId) query.examId = examId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [results, total] = await Promise.all([
    ExamResult.find(query)
      .populate('examId', 'title organization')
      .populate('userId', 'fullname email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ExamResult.countDocuments(query),
  ]);

  return success(res, {
    data: {
      results,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
    message: 'Exam results retrieved successfully.',
  });
});

/**
 * @desc    Get all applications with search and pagination
 * @route   GET /api/v1/admin/applications
 * @access  Private (Admin only)
 */
const getAdminApplications = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};

  // Search by name, email, or aadhaar
  if (search) {
    query.$or = [
      { fullname: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { adhaar: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by status
  if (status && status !== 'all') {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('jobId', 'title')
      .populate('userId', 'fullname email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Application.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  return success(res, {
    data: {
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
    message: 'Applications retrieved successfully.',
  });
});

/**
 * @desc    Get single application for admin view (with companies + internships)
 * @route   GET /api/v1/admin/applications/:id
 * @access  Private (Admin only)
 */
const getAdminApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('jobId', 'title description')
    .populate('userId', 'fullname email phone');

  if (!application) {
    return next(
      new AppError('Application not found', 404, `No application with id ${req.params.id}`)
    );
  }

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
 * @desc    Accept application
 * @route   POST /api/v1/admin/applications/:id/accept
 * @access  Private (Admin only)
 */
const acceptApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status: 'accepted' },
    { new: true }
  );

  if (!application) {
    return next(
      new AppError('Application not found', 404, `No application with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: application,
    message: 'Application accepted successfully.',
  });
});

/**
 * @desc    Reject application
 * @route   POST /api/v1/admin/applications/:id/reject
 * @access  Private (Admin only)
 */
const rejectApplication = asyncHandler(async (req, res, next) => {
  const { adminMessage } = req.body;

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', adminMessage: adminMessage || '' },
    { new: true }
  );

  if (!application) {
    return next(
      new AppError('Application not found', 404, `No application with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: application,
    message: 'Application rejected successfully.',
  });
});

const listAdmins = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: 'user' } }).select(
    'fullname email phone role active createdAt'
  );
  return success(res, {
    data: users,
    message: 'Admin accounts retrieved successfully.',
  });
});

const createAdmin = asyncHandler(async (req, res, next) => {
  const { firstname, lastname, email, phone, dob, gender, qualification, password, role } =
    req.body;

  const roleOptions = [
    'admin',
    'exam_admin',
    'question_admin',
    'hallticket_admin',
    'grader_admin',
  ];
  if (!role || !roleOptions.includes(role)) {
    return next(new AppError(`Role must be one of: ${roleOptions.join(', ')}`, 400));
  }

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    return next(new AppError('A user already exists with this email or phone number', 400));
  }

  const user = await User.create({
    fullname: { firstname, lastname },
    email,
    phone,
    dob,
    gender,
    qualification,
    password,
    role,
  });

  return success(res, {
    data: { id: user._id, email: user.email, role: user.role },
    message: 'Admin account created successfully.',
    status: 201,
  });
});

const setAdminStatus = asyncHandler(async (req, res, next) => {
  const { active } = req.body;

  if (req.params.id === req.user._id.toString() && active === false) {
    return next(new AppError('You cannot deactivate your own account', 400));
  }

  const target = await User.findOne({ _id: req.params.id, role: { $ne: 'user' } });
  if (!target) {
    return next(new AppError('Admin account not found', 404));
  }

  target.active = active;
  await target.save();

  return success(res, {
    data: { id: target._id, email: target.email, role: target.role, active: target.active },
    message: active ? 'Account activated successfully.' : 'Account deactivated successfully.',
  });
});

const resetAdminPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const target = await User.findOne({ _id: req.params.id, role: { $ne: 'user' } }).select('+password');
  if (!target) {
    return next(new AppError('Admin account not found', 404));
  }

  target.password = password;
  await target.save();

  return success(res, {
    data: { id: target._id, email: target.email },
    message: 'Password reset successfully.',
  });
});

module.exports = {
  getDashboardStats,
  getAdminApplications,
  getAdminApplication,
  getAdminExamResults,
  acceptApplication,
  rejectApplication,
  listAdmins,
  createAdmin,
  setAdminStatus,
  resetAdminPassword,
};
