const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { getPlans, getMySubscription, subscribe, cancelSubscription, checkFeatureAccess } = require('../controllers/subscriptionController');
const router = express.Router();

router.get('/plans', getPlans);
router.get('/me', authenticate, getMySubscription);
router.post('/subscribe', authenticate, subscribe);
router.post('/cancel', authenticate, cancelSubscription);
router.get('/check/:feature', authenticate, checkFeatureAccess);

module.exports = router;
