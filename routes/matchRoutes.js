const express = require('express');
const router = express.Router();
const {
  getMatchForJob,
  getAllMatches,
  getCandidatesForJob,
  addRequirement,
  removeRequirement,
} = require('../controllers/matchController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const {
  requirementValidator,
  requirementKeyValidator,
  jobIdValidator,
} = require('../validators/matchValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/jobs', authenticate, getAllMatches);
router.get('/jobs/:id', authenticate, jobIdValidator, validateRequest, getMatchForJob);
router.get('/jobs/:id/candidates', authenticate, authorize('admin'), jobIdValidator, validateRequest, getCandidatesForJob);
router.post('/jobs/:id/requirements', authenticate, authorize('admin'), requirementValidator, validateRequest, addRequirement);
router.delete('/jobs/:id/requirements/:skillKey', authenticate, authorize('admin'), requirementKeyValidator, validateRequest, removeRequirement);

module.exports = router;