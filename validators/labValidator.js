const { body, param } = require('express-validator');

const runCodeValidator = [
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust'])
    .withMessage('Unsupported language'),
  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 50000 })
    .withMessage('Code cannot exceed 50000 characters'),
  body('input').optional().isString().isLength({ max: 10000 }).withMessage('Input cannot exceed 10000 characters'),
];

const snippetValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Snippet title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required')
    .isLength({ max: 40 })
    .withMessage('Language cannot exceed 40 characters'),
  body('code').optional().isString().isLength({ max: 50000 }).withMessage('Code cannot exceed 50000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
];

const snippetUpdateValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Snippet title cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('language')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Language cannot be empty')
    .isLength({ max: 40 })
    .withMessage('Language cannot exceed 40 characters'),
  body('code').optional().isString().isLength({ max: 50000 }).withMessage('Code cannot exceed 50000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
];

const snippetIdValidator = [
  param('id').isMongoId().withMessage('Invalid snippet ID'),
];

const sessionTypeValidator = [
  body('sessionType')
    .optional()
    .isIn(['code-server', 'desktop'])
    .withMessage('Session type must be code-server or desktop'),
];

const sessionIdValidator = [
  param('id').isMongoId().withMessage('Invalid session ID'),
];

module.exports = {
  runCodeValidator,
  snippetValidator,
  snippetUpdateValidator,
  snippetIdValidator,
  sessionTypeValidator,
  sessionIdValidator,
};