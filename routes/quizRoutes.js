const express = require('express');
const router = express.Router();
const {
  getCourseQuizzes,
  submitAttempt,
  getMyAttempts,
} = require('../controllers/quizController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  courseSlugValidator,
  quizIdValidator,
  quizSubmitValidator,
} = require('../validators/courseValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/course/:slug', authenticate, courseSlugValidator, validateRequest, getCourseQuizzes);
router.post('/:id/attempt', authenticate, quizSubmitValidator, validateRequest, submitAttempt);
router.get('/:id/attempts/mine', authenticate, quizIdValidator, validateRequest, getMyAttempts);

module.exports = router;