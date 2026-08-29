const express = require('express');
const router = express.Router();
const {
  getExams,
  getExam,
  getExamQuestions,
  submitExam,
  getMyExamResults,
  getMyExamResult,
  createExamAdmin,
  updateExam,
  deleteExam,
} = require('../controllers/examController');
const {
  examValidator,
  examIdValidator,
  resultIdValidator,
  submitExamValidator,
} = require('../validators/examValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', getExams);
router.get('/results', authenticate, getMyExamResults);
router.get('/results/:id', authenticate, resultIdValidator, validateRequest, getMyExamResult);
router.get('/:id', examIdValidator, validateRequest, getExam);
router.get('/:id/questions', authenticate, examIdValidator, validateRequest, getExamQuestions);
router.post('/:id/submit', authenticate, examIdValidator, submitExamValidator, validateRequest, submitExam);
router.post('/', authenticate, authorize('admin', 'exam_admin', 'superadmin'), examValidator, validateRequest, createExamAdmin);
router.put('/:id', authenticate, authorize('admin', 'exam_admin', 'superadmin'), examIdValidator, examValidator, validateRequest, updateExam);
router.delete('/:id', authenticate, authorize('admin', 'exam_admin', 'superadmin'), examIdValidator, validateRequest, deleteExam);

module.exports = router;
