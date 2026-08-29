const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
} = require('../controllers/profileController');
const { authenticate } = require('../middlewares/authMiddleware');
const { profileValidator } = require('../validators/profileValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, profileValidator, validateRequest, updateMyProfile);
router.get('/:id', getPublicProfile);

module.exports = router;