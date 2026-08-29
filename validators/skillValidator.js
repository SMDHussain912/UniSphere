const { body, param } = require('express-validator');

const evidenceValidator = [
  param('key').trim().notEmpty().withMessage('Skill key is required').isLength({ max: 60 }).withMessage('Skill key cannot exceed 60 characters'),
  body('type')
    .notEmpty()
    .withMessage('Evidence type is required')
    .isIn(['course_completed', 'exercise', 'project', 'assessment', 'external', 'certification'])
    .withMessage('Invalid evidence type'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Evidence title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('source').optional().trim().isLength({ max: 200 }).withMessage('Source cannot exceed 200 characters'),
  body('sourceUrl').optional().trim().isLength({ max: 500 }).withMessage('Source URL cannot exceed 500 characters'),
  body('score').optional({ values: 'falsy' }).isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('count').optional().isInt({ min: 1, max: 1000 }).withMessage('Count must be between 1 and 1000'),
];

const skillKeyParamValidator = [
  param('key').trim().notEmpty().withMessage('Skill key is required'),
];

const evidenceIdParamValidator = [
  param('key').trim().notEmpty().withMessage('Skill key is required'),
  param('evidenceId').isMongoId().withMessage('Invalid evidence ID'),
];

module.exports = {
  evidenceValidator,
  skillKeyParamValidator,
  evidenceIdParamValidator,
};