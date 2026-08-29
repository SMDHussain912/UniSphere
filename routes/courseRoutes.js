const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  getMyProgress,
  completeLesson,
} = require('../controllers/courseController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  listCoursesValidator,
  courseSlugValidator,
  lessonCompleteValidator,
} = require('../validators/courseValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', listCoursesValidator, validateRequest, getCourses);
router.get('/my/progress', authenticate, getMyProgress);
router.get('/:slug', courseSlugValidator, validateRequest, getCourse);
router.post(
  '/:slug/lessons/:lessonId/complete',
  authenticate,
  lessonCompleteValidator,
  validateRequest,
  completeLesson
);

module.exports = router;