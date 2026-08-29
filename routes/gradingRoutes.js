const express = require('express');
const router = express.Router();
const {
  listAnswerSheets,
  getAnswerSheet,
  scoreAnswerSheet,
} = require('../controllers/gradingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { sheetIdValidator, scoreSheetValidator } = require('../validators/workflowValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/admin/grading', authenticate, authorize('grader_admin', 'admin', 'superadmin'), listAnswerSheets);
router.get('/admin/grading/:id', authenticate, authorize('grader_admin', 'admin', 'superadmin'), sheetIdValidator, validateRequest, getAnswerSheet);
router.post('/admin/grading/:id/score', authenticate, authorize('grader_admin', 'superadmin'), scoreSheetValidator, validateRequest, scoreAnswerSheet);

module.exports = router;
