const express = require('express');
const router = express.Router();
const {
  getNews,
  getSingleNews,
  createNews,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

const newsValidator = [
  body('title').trim().notEmpty().withMessage('News title is required'),
  body('category').trim().notEmpty().withMessage('News category is required'),
  body('description').trim().notEmpty().withMessage('News description is required'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
];

const newsIdValidator = [
  param('id').isMongoId().withMessage('Invalid news ID'),
];

// Public routes
router.get('/', getNews);
router.get('/:id', newsIdValidator, validateRequest, getSingleNews);

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  newsValidator,
  validateRequest,
  createNews
);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  newsIdValidator,
  newsValidator,
  validateRequest,
  updateNews
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  newsIdValidator,
  validateRequest,
  deleteNews
);

module.exports = router;
