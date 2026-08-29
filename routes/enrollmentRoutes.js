const express = require('express');
const router = express.Router();
const {
  enroll,
  getMyEnrollments,
  adminListEnrollments,
  updateEnrollmentStatus,
} = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { enrollmentStatusValidator } = require('../validators/workflowValidator');
const validateRequest = require('../middlewares/validateRequest');

router.post('/exams/:examId/enroll', authenticate, enroll);
router.get('/enrollments', authenticate, getMyEnrollments);

router.get('/admin/enrollments', authenticate, authorize('exam_admin', 'hallticket_admin', 'admin', 'superadmin'), adminListEnrollments);
router.post('/admin/enrollments/:id/status', authenticate, authorize('exam_admin', 'superadmin'), enrollmentStatusValidator, validateRequest, updateEnrollmentStatus);

module.exports = router;
