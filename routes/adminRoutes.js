const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminApplications,
  getAdminApplication,
  getAdminExamResults,
  acceptApplication,
  rejectApplication,
  listAdmins,
  createAdmin,
  setAdminStatus,
  resetAdminPassword,
} = require('../controllers/adminController');
const { authenticate, authorize, authorizeAdmin } = require('../middlewares/authMiddleware');
const { applicationIdValidator } = require('../validators/applicationValidator');
const {
  adminAccountValidator,
  adminIdValidator,
  adminStatusValidator,
  resetPasswordValidator,
} = require('../validators/workflowValidator');
const validateRequest = require('../middlewares/validateRequest');

router.use(authenticate);

router.get('/stats', authorizeAdmin, getDashboardStats);

router.get('/applications', authorize('admin', 'superadmin'), getAdminApplications);
router.get('/applications/:id', authorize('admin', 'superadmin'), applicationIdValidator, validateRequest, getAdminApplication);
router.post('/applications/:id/accept', authorize('admin', 'superadmin'), applicationIdValidator, validateRequest, acceptApplication);
router.post('/applications/:id/reject', authorize('admin', 'superadmin'), applicationIdValidator, validateRequest, rejectApplication);

router.get('/exam-results', authorize('admin', 'superadmin', 'exam_admin', 'grader_admin'), getAdminExamResults);

router.get('/admins', authorize('superadmin'), listAdmins);
router.post('/admins', authorize('superadmin'), adminAccountValidator, validateRequest, createAdmin);
router.post(
  '/admins/:id/status',
  authorize('superadmin'),
  adminIdValidator,
  adminStatusValidator,
  validateRequest,
  setAdminStatus
);
router.post(
  '/admins/:id/reset-password',
  authorize('superadmin'),
  adminIdValidator,
  resetPasswordValidator,
  validateRequest,
  resetAdminPassword
);

module.exports = router;
