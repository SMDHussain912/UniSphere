const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  createPaper,
  listPapers,
  getPaper,
  uploadAnswerKey,
  publishAnswerKey,
  setPaperStatus,
  deletePaper,
} = require('../controllers/questionPaperController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { paperValidator, paperIdValidator, paperStatusValidator } = require('../validators/workflowValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/admin/question-papers', authenticate, authorize('question_admin', 'admin', 'superadmin'), listPapers);
router.post('/admin/question-papers', authenticate, authorize('question_admin', 'superadmin'), paperValidator, validateRequest, createPaper);
router.get('/admin/question-papers/:id', authenticate, authorize('question_admin', 'admin', 'superadmin'), paperIdValidator, validateRequest, getPaper);
router.post(
  '/admin/question-papers/:id/answer-key',
  authenticate,
  authorize('question_admin', 'superadmin'),
  paperIdValidator,
  validateRequest,
  upload.single('answerKey'),
  uploadAnswerKey
);
router.post('/admin/question-papers/:id/answer-key/publish', authenticate, authorize('question_admin', 'superadmin'), paperIdValidator, validateRequest, publishAnswerKey);
router.put('/admin/question-papers/:id/status', authenticate, authorize('question_admin', 'superadmin'), paperStatusValidator, validateRequest, setPaperStatus);
router.delete('/admin/question-papers/:id', authenticate, authorize('question_admin', 'superadmin'), paperIdValidator, validateRequest, deletePaper);

module.exports = router;
