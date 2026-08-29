const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const {
  submitProject,
  getMySubmissions,
  getSubmission,
  runTests,
  addReview,
  getProjectSubmissions,
} = require('../controllers/projectSubmissionController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  projectValidator,
  projectUpdateValidator,
  projectIdValidator,
  projectSlugValidator,
  submissionValidator,
  reviewValidator,
  projectQueryValidator,
} = require('../validators/projectValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', projectQueryValidator, validateRequest, getProjects);
router.get('/:slug', projectSlugValidator, validateRequest, getProject);

router.post('/', authenticate, projectValidator, validateRequest, createProject);
router.put('/:id', authenticate, projectIdValidator, validateRequest, projectUpdateValidator, validateRequest, updateProject);
router.delete('/:id', authenticate, projectIdValidator, validateRequest, deleteProject);

router.get('/submissions/mine', authenticate, getMySubmissions);
router.get('/submissions/:id', authenticate, projectIdValidator, validateRequest, getSubmission);
router.post('/:id/submit', authenticate, submissionValidator, validateRequest, submitProject);
router.post('/submissions/:id/test', authenticate, projectIdValidator, validateRequest, runTests);
router.post('/submissions/:id/review', authenticate, reviewValidator, validateRequest, addReview);
router.get('/:id/submissions', projectIdValidator, validateRequest, getProjectSubmissions);

module.exports = router;