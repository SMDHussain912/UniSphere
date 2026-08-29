const QuestionPaper = require('../models/QuestionPaper');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const createPaper = asyncHandler(async (req, res, next) => {
  const { examId, title, paperType, setCode, questions = [] } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) return next(new AppError('Exam not found', 404));

  const validQuestions = await Question.find({ _id: { $in: questions } });
  const totalMarks = validQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const paper = await QuestionPaper.create({
    examId,
    title: title || `${exam.title} - Paper`,
    paperType: paperType || 'MCQ',
    setCode: setCode || 'A',
    questions: validQuestions.map((q) => q._id),
    totalMarks,
    status: 'Draft',
  });

  return success(res, { data: paper, message: 'Question paper created successfully.', status: 201 });
});

const listPapers = asyncHandler(async (req, res) => {
  const { examId, status, page = 1, limit = 50 } = req.query;
  const query = {};
  if (examId) query.examId = examId;
  if (status && status !== 'all') query.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [papers, total] = await Promise.all([
    QuestionPaper.find(query).populate('examId', 'title').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    QuestionPaper.countDocuments(query),
  ]);
  return success(res, {
    data: { papers, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalItems: total, itemsPerPage: parseInt(limit) } },
    message: 'Question papers retrieved successfully.',
  });
});

const getPaper = asyncHandler(async (req, res, next) => {
  const paper = await QuestionPaper.findById(req.params.id)
    .populate('examId', 'title')
    .populate('questions');
  if (!paper) return next(new AppError('Question paper not found', 404));
  return success(res, { data: paper });
});

const uploadAnswerKey = asyncHandler(async (req, res, next) => {
  const paper = await QuestionPaper.findById(req.params.id);
  if (!paper) return next(new AppError('Question paper not found', 404));
  if (!req.file) return next(new AppError('Answer key file is required', 400));

  paper.answerKey.uploaded = true;
  paper.answerKey.fileName = req.file.originalname;
  paper.answerKey.path = 'uploads/' + req.file.filename;
  await paper.save();

  return success(res, { data: paper, message: 'Answer key uploaded successfully.' });
});

const publishAnswerKey = asyncHandler(async (req, res, next) => {
  const paper = await QuestionPaper.findById(req.params.id);
  if (!paper) return next(new AppError('Question paper not found', 404));
  paper.answerKey.published = true;
  await paper.save();
  return success(res, { data: paper, message: 'Answer key published successfully.' });
});

const setPaperStatus = asyncHandler(async (req, res, next) => {
  const paper = await QuestionPaper.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!paper) return next(new AppError('Question paper not found', 404));
  return success(res, { data: paper, message: 'Question paper status updated successfully.' });
});

const deletePaper = asyncHandler(async (req, res, next) => {
  const paper = await QuestionPaper.findByIdAndDelete(req.params.id);
  if (!paper) return next(new AppError('Question paper not found', 404));
  return success(res, { data: paper, message: 'Question paper deleted successfully.' });
});

module.exports = { createPaper, listPapers, getPaper, uploadAnswerKey, publishAnswerKey, setPaperStatus, deletePaper };
