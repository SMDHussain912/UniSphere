const { body, param } = require('express-validator');

const profileValidator = [
  body('headline').optional().trim().isLength({ max: 120 }).withMessage('Headline cannot exceed 120 characters'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
  body('avatarUrl').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
  body('coverUrl').optional().trim().isURL().withMessage('Cover must be a valid URL'),
  body('location').optional().trim().isLength({ max: 80 }).withMessage('Location cannot exceed 80 characters'),
  body('website').optional().trim().isURL().withMessage('Website must be a valid URL'),
  body('github').optional().trim().isLength({ max: 80 }).withMessage('GitHub username cannot exceed 80 characters'),
  body('linkedin').optional().trim().isLength({ max: 80 }).withMessage('LinkedIn cannot exceed 80 characters'),
  body('skills').optional().isArray({ max: 30 }).withMessage('Skills must be an array with at most 30 items'),
  body('skills.*').optional().trim().isLength({ max: 40 }).withMessage('Each skill cannot exceed 40 characters'),
  body('interests').optional().isArray({ max: 20 }).withMessage('Interests must be an array with at most 20 items'),
  body('interests.*').optional().trim().isLength({ max: 40 }).withMessage('Each interest cannot exceed 40 characters'),
  body('experience').optional().trim().isLength({ max: 500 }).withMessage('Experience cannot exceed 500 characters'),
  body('education').optional().trim().isLength({ max: 500 }).withMessage('Education cannot exceed 500 characters'),
  body('availableForWork').optional().isBoolean().withMessage('Available for work must be a boolean'),
  body('visibility').optional().isIn(['public', 'connections', 'private']).withMessage('Visibility must be public, connections, or private'),
];

const userIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

module.exports = {
  profileValidator,
  userIdParamValidator,
};