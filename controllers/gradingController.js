const AnswerSheet = require('../models/AnswerSheet');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const listAnswerSheets = asyncHandler(async (req, res) => {
  const { status, examId, page = 1, limit = 15 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (examId) query.examId = examId;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [sheets, total] = await Promise.all([
    AnswerSheet.find(query)
      .populate('userId', 'fullname email')
      .populate('examId', 'title totalMarks passingMarks')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    AnswerSheet.countDocuments(query),
  ]);
  return success(res, {
    data: { sheets, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalItems: total, itemsPerPage: parseInt(limit) } },
    message: 'Answer sheets retrieved successfully.',
  });
});

const getAnswerSheet = asyncHandler(async (req, res, next) => {
  const sheet = await AnswerSheet.findById(req.params.id)
    .populate('userId', 'fullname email')
    .populate('examId', 'title totalMarks passingMarks')
    .populate({ path: 'answers.questionId', select: 'question marks options' });
  if (!sheet) return next(new AppError('Answer sheet not found', 404));
  return success(res, { data: sheet });
});

const scoreAnswerSheet = asyncHandler(async (req, res, next) => {
  const sheet = await AnswerSheet.findById(req.params.id);
  if (!sheet) return next(new AppError('Answer sheet not found', 404));
  if (sheet.status === 'graded') return next(new AppError('This answer sheet has already been graded', 400));

  const marks = req.body.marks || [];
  const marksMap = {};
  marks.forEach((m) => {
    if (m.questionId) marksMap[String(m.questionId)] = Number(m.awarded) || 0;
  });

  sheet.answers.forEach((a) => {
    if (marksMap[String(a.questionId)] !== undefined) {
      a.awarded = marksMap[String(a.questionId)];
    }
  });

  const manualMarks = sheet.answers.reduce((sum, a) => sum + (a.awarded || 0), 0);
  const total = sheet.autoScore + manualMarks;

  const exam = await Exam.findById(sheet.examId);
  const percentage = exam && exam.totalMarks > 0
    ? Math.round((total / exam.totalMarks) * 10000) / 100
    : 0;
  const finalStatus = exam && total >= exam.passingMarks ? 'Passed' : 'Failed';

  sheet.manualMarks = manualMarks;
  sheet.totalMarks = total;
  sheet.status = 'graded';
  sheet.gradedBy = req.user._id;
  sheet.gradedAt = new Date();
  if (req.body.feedback !== undefined) sheet.feedback = req.body.feedback;
  await sheet.save();

  if (sheet.examResultId) {
    await ExamResult.findByIdAndUpdate(sheet.examResultId, {
      score: total,
      totalMarks: exam ? exam.totalMarks : sheet.totalMarks,
      percentage,
      status: finalStatus,
    });
  }

  return success(res, { data: sheet, message: 'Answer sheet graded successfully.' });
});

module.exports = { listAnswerSheets, getAnswerSheet, scoreAnswerSheet };
