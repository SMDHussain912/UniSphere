const { body, param, query } = require('express-validator');

const projectValidator = [
  body('title').trim().notEmpty().withMessage('Project title is required').isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('slug').trim().notEmpty().withMessage('Slug is required').isSlug().withMessage('Slug must be a valid URL-friendly identifier'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  body('skillKeys').optional().isArray({ max: 10 }).withMessage('Skill keys must be an array with at most 10 items'),
  body('skillKeys.*').optional().trim().isLength({ max: 60 }).withMessage('Each skill key cannot exceed 60 characters'),
  body('starterCode').optional().isString().isLength({ max: 50000 }).withMessage('Starter code cannot exceed 50000 characters'),
  body('starterRepoUrl').optional().isURL().withMessage('Starter repo must be a valid URL'),
  body('testCriteria').optional().isArray().withMessage('Test criteria must be an array'),
  body('testCriteria.*.name').optional().trim().isLength({ max: 100 }).withMessage('Test name cannot exceed 100 characters'),
  body('testCriteria.*.command').optional().trim().isLength({ max: 200 }).withMessage('Test command cannot exceed 200 characters'),
  body('testCriteria.*.expectedOutput').optional().trim().isLength({ max: 500 }).withMessage('Expected output cannot exceed 500 characters'),
  body('testCriteria.*.points').optional().isInt({ min: 0, max: 1000 }).withMessage('Points must be between 0 and 1000'),
  body('estimatedHours').optional().isInt({ min: 1, max: 1000 }).withMessage('Estimated hours must be between 1 and 1000'),
];

const projectUpdateValidator = [
  body('title').optional().trim().isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  body('skillKeys').optional().isArray({ max: 10 }).withMessage('Skill keys must be an array with at most 10 items'),
  body('skillKeys.*').optional().trim().isLength({ max: 60 }).withMessage('Each skill key cannot exceed 60 characters'),
  body('starterCode').optional().isString().isLength({ max: 50000 }).withMessage('Starter code cannot exceed 50000 characters'),
  body('starterRepoUrl').optional().isURL().withMessage('Starter repo must be a valid URL'),
  body('testCriteria').optional().isArray().withMessage('Test criteria must be an array'),
  body('testCriteria.*.name').optional().trim().isLength({ max: 100 }).withMessage('Test name cannot exceed 100 characters'),
  body('testCriteria.*.command').optional().trim().isLength({ max: 200 }).withMessage('Test command cannot exceed 200 characters'),
  body('testCriteria.*.expectedOutput').optional().trim().isLength({ max: 500 }).withMessage('Expected output cannot exceed 500 characters'),
  body('testCriteria.*.points').optional().isInt({ min: 0, max: 1000 }).withMessage('Points must be between 0 and 1000'),
  body('estimatedHours').optional().isInt({ min: 1, max: 1000 }).withMessage('Estimated hours must be between 1 and 1000'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
];

const projectIdValidator = [
  param('id').isMongoId().withMessage('Invalid project ID'),
];

const projectSlugValidator = [
  param('slug').trim().notEmpty().withMessage('Slug is required'),
];

const submissionValidator = [
  param('id').isMongoId().withMessage('Invalid submission ID'),
  body('repoUrl').optional().isURL().withMessage('Repo URL must be a valid URL'),
  body('demoUrl').optional().isURL().withMessage('Demo URL must be a valid URL'),
  body('code').optional().isString().isLength({ max: 50000 }).withMessage('Code cannot exceed 50000 characters'),
];

const reviewValidator = [
  param('id').isMongoId().withMessage('Invalid submission ID'),
  body('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback cannot exceed 1000 characters'),
];

const projectQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  query('skillKey').optional().trim().isLength({ max: 60 }).withMessage('Skill key cannot exceed 60 characters'),
  query('q').optional().trim().isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
];

module.exports = {
  projectValidator,
  projectUpdateValidator,
  projectIdValidator,
  projectSlugValidator,
  submissionValidator,
  reviewValidator,
  projectQueryValidator,
};
