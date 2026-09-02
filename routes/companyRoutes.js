const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { requirePlan } = require('../middlewares/planGate');
const { searchCandidates, getCompanyProfile, updateCompanyProfile, postJob, getMyJobs } = require('../controllers/companyController');
const router = express.Router();

router.get('/candidates', authenticate, requirePlan('company'), searchCandidates);
router.get('/profile', authenticate, authorize('company'), getCompanyProfile);
router.put('/profile', authenticate, authorize('company'), updateCompanyProfile);
router.post('/jobs', authenticate, authorize('company'), requirePlan('company'), postJob);
router.get('/jobs', authenticate, authorize('company'), getMyJobs);

module.exports = router;
