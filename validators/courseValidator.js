const { body, param, query } = require('express-validator');

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'all'];
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const listCoursesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('level')
    .optional({ checkFalsy: true })
    .isIn(LEVELS)
    .withMessage('Invalid course level'),
  query('category').optional({ checkFalsy: true }).isString(),
  query('q').optional({ checkFalsy: true }).isString(),
];

const courseSlugValidator = [
  param('slug').matches(SLUG_PATTERN).withMessage('Invalid course slug'),
];

const lessonCompleteValidator = [
  param('slug').matches(SLUG_PATTERN).withMessage('Invalid course slug'),
  param('lessonId').matches(/^m\d+-l\d+$/).withMessage('Invalid lesson ID'),
];

const quizIdValidator = [param('id').isMongoId().withMessage('Invalid quiz ID')];

const quizSubmitValidator = [
  param('id').isMongoId().withMessage('Invalid quiz ID'),
  body('answers').isArray({ min: 1 }).withMessage('Answers must be a non-empty array'),
  body('answers.*.questionIndex')
    .isInt({ min: 0 })
    .withMessage('questionIndex must be zero or more'),
  body('answers.*.selected').isInt({ min: 0 }).withMessage('selected must be zero or more'),
];

module.exports = {
  listCoursesValidator,
  courseSlugValidator,
  lessonCompleteValidator,
  quizIdValidator,
  quizSubmitValidator,
};