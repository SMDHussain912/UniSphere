const { body, param } = require('express-validator');

const examValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Exam title is required')
    .isLength({ max: 150 })
    .withMessage('Exam title cannot exceed 150 characters'),
  body('description').trim().notEmpty().withMessage('Exam description is required'),
  body('category').trim().notEmpty().withMessage('Exam category is required'),
  body('qualification').trim().notEmpty().withMessage('Qualification is required'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('examType').optional().isIn(['MCQ', 'Descriptive', 'Mixed']).withMessage('Exam type must be MCQ, Descriptive or Mixed'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
  body('passingMarks').isInt({ min: 0 }).withMessage('Passing marks must be zero or more'),
  body('vacancies').optional().isInt({ min: 0 }).withMessage('Vacancies must be zero or more'),
  body('applicationFee').optional().isInt({ min: 0 }).withMessage('Application fee must be zero or more'),
  body('lastDate').notEmpty().withMessage('Last date is required').isISO8601().withMessage('Please provide a valid last date'),
  body('examDate').optional({ values: 'falsy' }).isISO8601().withMessage('Please provide a valid exam date'),
  body('status').optional().isIn(['Active', 'Inactive', 'Closed']).withMessage('Status must be Active, Inactive or Closed'),
];

const examIdValidator = [param('id').isMongoId().withMessage('Invalid exam ID')];

const resultIdValidator = [param('id').isMongoId().withMessage('Invalid result ID')];

const submitExamValidator = [body('answers').isArray().withMessage('Answers must be an array')];

const questionValidator = [
  body('examId').isMongoId().withMessage('Invalid exam ID'),
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('questionType').optional().isIn(['MCQ', 'Descriptive']).withMessage('Question type must be MCQ or Descriptive'),
  body('options')
    .if((value, { req }) => (req.body.questionType || 'MCQ') === 'MCQ')
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must contain between 2 and 6 choices'),
  body('correctAnswer')
    .if((value, { req }) => (req.body.questionType || 'MCQ') === 'MCQ')
    .isInt({ min: 0 })
    .withMessage('Correct answer index is required'),
  body('marks').optional().isInt({ min: 0 }).withMessage('Marks must be zero or more'),
];

const questionIdValidator = [param('id').isMongoId().withMessage('Invalid question ID')];

module.exports = {
  examValidator,
  examIdValidator,
  resultIdValidator,
  submitExamValidator,
  questionValidator,
  questionIdValidator,
};
