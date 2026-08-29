const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { jobValidator, jobIdValidator } = require('../validators/jobValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getJobs);
router.get('/:id', jobIdValidator, validateRequest, getJob);

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  jobValidator,
  validateRequest,
  createJob
);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  jobIdValidator,
  jobValidator,
  validateRequest,
  updateJob
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  jobIdValidator,
  validateRequest,
  deleteJob
);

module.exports = router;
