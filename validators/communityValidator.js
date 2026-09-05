const { body, param } = require('express-validator');

const communityValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Community name is required')
    .isLength({ max: 100 })
    .withMessage('Community name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

const discussionValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Discussion title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Discussion category is required')
    .isLength({ max: 60 })
    .withMessage('Category cannot exceed 60 characters'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Discussion body is required')
    .isLength({ max: 20000 })
    .withMessage('Body cannot exceed 20000 characters'),
];

const answerValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Answer content is required')
    .isLength({ max: 5000 })
    .withMessage('Answer cannot exceed 5000 characters'),
];

const discussionIdValidator = [param('id').isMongoId().withMessage('Invalid discussion ID')];

module.exports = {
  communityValidator,
  discussionValidator,
  answerValidator,
  discussionIdValidator,
};