const Question = require('../models/Question');
const Exam = require('../models/Exam');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const getQuestions = asyncHandler(async (req, res) => {
  const { examId, page = 1, limit = 50 } = req.query;
  const query = {};
  if (examId) query.examId = examId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [questions, total] = await Promise.all([
    Question.find(query).sort({ createdAt: 1 }).skip(skip).limit(parseInt(limit)),
    Question.countDocuments(query),
  ]);

  return success(res, {
    data: {
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
    message: 'Questions retrieved successfully.',
  });
});

const createQuestion = asyncHandler(async (req, res, next) => {
  const { examId, question, questionType, options, correctAnswer, marks } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) {
    return next(new AppError('Exam not found', 404));
  }

  const isDescriptive = questionType === 'Descriptive';

  if (!isDescriptive) {
    if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
      return next(new AppError('Options must contain between 2 and 6 choices', 400));
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return next(new AppError('Correct answer index is out of range', 400));
    }
  }

  const created = await Question.create({
    examId,
    question,
    questionType: questionType || 'MCQ',
    options: isDescriptive ? [] : options,
    correctAnswer: isDescriptive ? undefined : correctAnswer,
    marks: marks || 1,
  });

  return success(res, {
    data: created,
    message: 'Question created successfully.',
    status: 201,
  });
});

const updateQuestion = asyncHandler(async (req, res, next) => {
  const { options, correctAnswer, questionType } = req.body;
  const isDescriptive = questionType === 'Descriptive';

  if (
    !isDescriptive &&
    options &&
    (!Array.isArray(options) || options.length < 2 || options.length > 6)
  ) {
    return next(new AppError('Options must contain between 2 and 6 choices', 400));
  }

  if (!isDescriptive && options && (correctAnswer < 0 || correctAnswer >= options.length)) {
    return next(new AppError('Correct answer index is out of range', 400));
  }

  const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return next(
      new AppError('Question not found', 404, `No question exists with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: updated,
    message: 'Question updated successfully.',
  });
});

const deleteQuestion = asyncHandler(async (req, res, next) => {
  const deleted = await Question.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return next(
      new AppError('Question not found', 404, `No question exists with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: deleted,
    message: 'Question deleted successfully.',
  });
});

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
