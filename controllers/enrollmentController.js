const ExamEnrollment = require('../models/ExamEnrollment');
const Exam = require('../models/Exam');
const ExamCenter = require('../models/ExamCenter');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const enroll = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) return next(new AppError('Exam not found', 404));
  if (exam.status === 'Inactive' || exam.status === 'Closed') {
    return next(new AppError('This exam is not accepting enrollments', 400));
  }

  const existing = await ExamEnrollment.findOne({ examId: exam._id, userId: req.user._id });
  if (existing) return next(new AppError('You have already enrolled for this exam', 400));

  const enrollment = await ExamEnrollment.create({
    userId: req.user._id,
    examId: exam._id,
    formData: req.body.formData || {},
    feePaid: Boolean(req.body.feePaid),
    status: 'applied',
  });

  return success(res, { data: enrollment, message: 'Enrollment submitted successfully.', status: 201 });
});

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await ExamEnrollment.find({ userId: req.user._id })
    .populate('examId', 'title organization examDate totalMarks passingMarks')
    .populate('centerId', 'name city code')
    .sort({ createdAt: -1 });
  return success(res, { data: enrollments, message: 'Enrollments retrieved successfully.' });
});

const adminListEnrollments = asyncHandler(async (req, res) => {
  const { status, examId, page = 1, limit = 15 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (examId) query.examId = examId;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [enrollments, total] = await Promise.all([
    ExamEnrollment.find(query)
      .populate('userId', 'fullname email phone')
      .populate('examId', 'title organization')
      .populate('centerId', 'name city code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ExamEnrollment.countDocuments(query),
  ]);
  return success(res, {
    data: { enrollments, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalItems: total, itemsPerPage: parseInt(limit) } },
    message: 'Enrollments retrieved successfully.',
  });
});

const updateEnrollmentStatus = asyncHandler(async (req, res, next) => {
  const { status, centerId, adminMessage, feePaid } = req.body;
  const enrollment = await ExamEnrollment.findById(req.params.id);
  if (!enrollment) return next(new AppError('Enrollment not found', 404));

  if (centerId) {
    const center = await ExamCenter.findById(centerId);
    if (!center) return next(new AppError('Exam center not found', 404));
    enrollment.centerId = centerId;
  }
  enrollment.status = status || enrollment.status;
  if (adminMessage !== undefined) enrollment.adminMessage = adminMessage;
  if (feePaid !== undefined) enrollment.feePaid = Boolean(feePaid);

  await enrollment.save();
  return success(res, { data: enrollment, message: 'Enrollment status updated successfully.' });
});

module.exports = { enroll, getMyEnrollments, adminListEnrollments, updateEnrollmentStatus };
