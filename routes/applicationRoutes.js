const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const {
  applicationValidator,
  applicationIdValidator,
} = require('../validators/applicationValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// All routes require authentication
router.use(authenticate);

// Get all applications (admin: all, user: own)
router.get('/', getApplications);

// Get single application
router.get('/:id', applicationIdValidator, validateRequest, getApplication);

// Create application (with file uploads)
router.post(
  '/',
  upload.fields([
    { name: 'identityProof', maxCount: 1 },
    { name: 'sscMarksMemo', maxCount: 1 },
    { name: 'recentExaminationMarksMemo', maxCount: 1 },
    { name: 'incomeCertificate', maxCount: 1 },
    { name: 'casteCertificate', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  applicationValidator,
  validateRequest,
  createApplication
);

// Update application status (admin only)
router.put(
  '/:id/status',
  authorize('admin'),
  applicationIdValidator,
  validateRequest,
  updateApplicationStatus
);

module.exports = router;
