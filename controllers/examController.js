const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamResult = require('../models/ExamResult');
const AnswerSheet = require('../models/AnswerSheet');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const getExams = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
    ];
  }
  if (category && category !== 'all') query.category = category;
  if (status && status !== 'all') query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [exams, total] = await Promise.all([
    Exam.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Exam.countDocuments(query),
  ]);

  return success(res, {
    data: {
      exams,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
    message: 'Exams retrieved successfully.',
  });
});

const getExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(
      new AppError('Exam not found', 404, `No exam exists with id ${req.params.id}`)
    );
  }

  return success(res, { data: exam });
});

const getExamQuestions = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(
      new AppError('Exam not found', 404, `No exam exists with id ${req.params.id}`)
    );
  }

  if (exam.status === 'Inactive' || exam.status === 'Closed') {
    return next(new AppError('This exam is not available for taking', 400));
  }

  const existingResult = await ExamResult.findOne({
    examId: exam._id,
    userId: req.user._id,
  });
  if (existingResult) {
    return next(new AppError('You have already taken this exam', 400));
  }

  const questions = await Question.find({ examId: exam._id })
    .select('-correctAnswer')
    .sort({ createdAt: 1 });

  return success(res, {
    data: { exam, questions },
    message: 'Exam questions retrieved successfully.',
  });
});

const submitExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(
      new AppError('Exam not found', 404, `No exam exists with id ${req.params.id}`)
    );
  }

  if (exam.status === 'Inactive' || exam.status === 'Closed') {
    return next(new AppError('This exam is not accepting submissions', 400));
  }

  const existingResult = await ExamResult.findOne({
    examId: exam._id,
    userId: req.user._id,
  });
  if (existingResult) {
    return next(new AppError('You have already taken this exam', 400));
  }

  const questions = await Question.find({ examId: exam._id });
  const answerMap = new Map();
  questions.forEach((question) => answerMap.set(question._id.toString(), question));

  const answers = req.body.answers || [];
  const resultAnswers = [];
  let score = 0;

  answers.forEach((answer) => {
    const question = answerMap.get(String(answer.questionId));
    if (!question) return;
    const selected = Number(answer.selectedOption);
    const correct = selected === question.correctAnswer;
    const marks = correct ? question.marks : 0;
    if (correct) score += marks;
    resultAnswers.push({
      questionId: question._id,
      selectedOption: selected,
      correct,
      marks,
    });
  });

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const isAutoOnly = exam.examType === 'MCQ';

  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 10000) / 100 : 0;
  const status = isAutoOnly && score >= exam.passingMarks ? 'Passed' : 'Failed';

  const result = await ExamResult.create({
    examId: exam._id,
    userId: req.user._id,
    score,
    totalMarks: isAutoOnly ? totalMarks : exam.totalMarks,
    percentage: isAutoOnly ? percentage : 0,
    status: isAutoOnly ? status : 'Pending',
    answers: resultAnswers,
  });

  if (!isAutoOnly) {
    const descriptiveAnswers = Array.isArray(req.body.descriptiveAnswers)
      ? req.body.descriptiveAnswers
      : [];
    await AnswerSheet.create({
      userId: req.user._id,
      examId: exam._id,
      examResultId: result._id,
      autoScore: score,
      totalMarks: exam.totalMarks,
      status: 'pending',
      answers: descriptiveAnswers.map((a) => ({
        questionId: a.questionId,
        text: a.text || null,
        file: a.file || null,
        awarded: 0,
      })),
    });
  }

  return success(res, {
    data: result,
    message: isAutoOnly
      ? 'Exam submitted and graded successfully.'
      : 'Exam submitted successfully. Your answers are pending grading.',
    status: 201,
  });
});

const getMyExamResults = asyncHandler(async (req, res) => {
  const results = await ExamResult.find({ userId: req.user._id })
    .populate('examId', 'title organization totalMarks passingMarks')
    .sort({ submittedAt: -1 });

  return success(res, {
    data: results,
    message: 'Your exam results retrieved successfully.',
  });
});

const getMyExamResult = asyncHandler(async (req, res, next) => {
  const result = await ExamResult.findOne({
    _id: req.params.id,
    userId: req.user._id,
  })
    .populate('examId', 'title organization totalMarks passingMarks')
    .populate('answers.questionId', 'question options');

  if (!result) {
    return next(
      new AppError('Exam result not found', 404, `No result exists with id ${req.params.id}`)
    );
  }

  return success(res, { data: result });
});

const createExamAdmin = asyncHandler(async (req, res, next) => {
  const exists = await Exam.findOne({ title: req.body.title });
  if (exists) {
    return next(new AppError('An exam with this title already exists', 400));
  }

  const exam = await Exam.create(req.body);
  return success(res, {
    data: exam,
    message: 'Exam created successfully.',
    status: 201,
  });
});

const updateExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!exam) {
    return next(
      new AppError('Exam not found', 404, `No exam exists with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: exam,
    message: 'Exam updated successfully.',
  });
});

const deleteExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);

  if (!exam) {
    return next(
      new AppError('Exam not found', 404, `No exam exists with id ${req.params.id}`)
    );
  }

  await Question.deleteMany({ examId: req.params.id });

  return success(res, {
    data: exam,
    message: 'Exam deleted successfully.',
  });
});

module.exports = {
  getExams,
  getExam,
  getExamQuestions,
  submitExam,
  getMyExamResults,
  getMyExamResult,
  createExamAdmin,
  updateExam,
  deleteExam,
};
