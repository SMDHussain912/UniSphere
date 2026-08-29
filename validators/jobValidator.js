const { body, param } = require('express-validator');

const jobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 100 })
    .withMessage('Job title cannot exceed 100 characters'),
  body('status')
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required'),
  body('qualification')
    .trim()
    .notEmpty()
    .withMessage('Qualification is required'),
  body('lastDate')
    .exists()
    .withMessage('Last date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
];

const jobIdValidator = [
  param('id').isMongoId().withMessage('Invalid job ID'),
];

module.exports = { jobValidator, jobIdValidator };
