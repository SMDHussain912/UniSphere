const { body, param } = require('express-validator');

const centerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Center name is required')
    .isLength({ max: 120 })
    .withMessage('Center name cannot exceed 120 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Center code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Center code must be between 2 and 10 characters')
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Center code must be alphanumeric'),
  body('address').trim().notEmpty().withMessage('Center address is required'),
  body('city').trim().notEmpty().withMessage('Center city is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

const centerIdValidator = [param('id').isMongoId().withMessage('Invalid center ID')];

const enrollmentStatusValidator = [
  param('id').isMongoId().withMessage('Invalid enrollment ID'),
  body('status').optional().isIn(['applied', 'confirmed', 'rejected']).withMessage('Invalid enrollment status'),
  body('centerId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid center ID'),
  body('adminMessage').optional().isString().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  body('feePaid').optional().isBoolean().withMessage('Fee paid must be a boolean'),
];

const hallTicketGenerateValidator = [
  body('enrollmentId').isMongoId().withMessage('Invalid enrollment ID'),
];

const paperValidator = [
  body('examId').isMongoId().withMessage('Invalid exam ID'),
  body('title').optional().trim().isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('paperType').optional().isIn(['MCQ', 'Descriptive', 'Mixed']).withMessage('Paper type must be MCQ, Descriptive or Mixed'),
  body('setCode').optional().trim().isLength({ max: 10 }).withMessage('Set code cannot exceed 10 characters'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('questions.*').optional().isMongoId().withMessage('Invalid question ID in questions'),
];

const paperIdValidator = [param('id').isMongoId().withMessage('Invalid paper ID')];

const paperStatusValidator = [
  param('id').isMongoId().withMessage('Invalid paper ID'),
  body('status').isIn(['Draft', 'Published', 'Closed']).withMessage('Status must be Draft, Published or Closed'),
];

const sheetIdValidator = [param('id').isMongoId().withMessage('Invalid answer sheet ID')];

const scoreSheetValidator = [
  param('id').isMongoId().withMessage('Invalid answer sheet ID'),
  body('marks').optional().isArray().withMessage('Marks must be an array'),
  body('marks.*.questionId').optional().isMongoId().withMessage('Invalid question ID in marks'),
  body('marks.*.awarded').optional().isInt({ min: 0 }).withMessage('Awarded marks must be zero or more'),
  body('feedback').optional().isString().isLength({ max: 1000 }).withMessage('Feedback cannot exceed 1000 characters'),
];

const adminAccountValidator = [
  body('firstname')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('First name must be between 3 and 30 characters'),
  body('lastname')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Last name must be between 3 and 30 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').trim().matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),
  body('dob').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('qualification').isIn(['10th Pass', '12th Pass', 'Diploma', 'Degree', 'B.Tech']).withMessage('Invalid qualification'),
  body('password').isLength({ min: 6, max: 1024 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'exam_admin', 'question_admin', 'hallticket_admin', 'grader_admin'])
    .withMessage('Invalid admin role'),
];

const adminIdValidator = [param('id').isMongoId().withMessage('Invalid admin ID')];

const adminStatusValidator = [
  body('active').isBoolean().withMessage('Active must be a boolean'),
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 6, max: 1024 })
    .withMessage('Password must be at least 6 characters'),
];

module.exports = {
  centerValidator,
  centerIdValidator,
  enrollmentStatusValidator,
  hallTicketGenerateValidator,
  paperValidator,
  paperIdValidator,
  paperStatusValidator,
  sheetIdValidator,
  scoreSheetValidator,
  adminAccountValidator,
  adminIdValidator,
  adminStatusValidator,
  resetPasswordValidator,
};