const express = require('express');
const router = express.Router();
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const {
  questionValidator,
  questionIdValidator,
} = require('../validators/examValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', getQuestions);
router.post('/', authenticate, authorize('admin', 'question_admin', 'superadmin'), questionValidator, validateRequest, createQuestion);
router.put('/:id', authenticate, authorize('admin', 'question_admin', 'superadmin'), questionIdValidator, questionValidator, validateRequest, updateQuestion);
router.delete('/:id', authenticate, authorize('admin', 'question_admin', 'superadmin'), questionIdValidator, validateRequest, deleteQuestion);

module.exports = router;
