const { body, param } = require('express-validator');

const requirementValidator = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  body('skillKey').trim().notEmpty().withMessage('Skill key is required').isLength({ max: 60 }).withMessage('Skill key cannot exceed 60 characters'),
  body('minimumLevel').optional().isInt({ min: 0, max: 100 }).withMessage('Minimum level must be between 0 and 100'),
  body('importance').optional().isInt({ min: 1, max: 3 }).withMessage('Importance must be between 1 and 3'),
];

const requirementKeyValidator = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  param('skillKey').trim().notEmpty().withMessage('Skill key is required'),
];

const jobIdValidator = [
  param('id').isMongoId().withMessage('Invalid job ID'),
];

module.exports = {
  requirementValidator,
  requirementKeyValidator,
  jobIdValidator,
};