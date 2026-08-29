const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getMyFollowers,
  getMyFollowing,
  isFollowing,
} = require('../controllers/followController');
const { authenticate } = require('../middlewares/authMiddleware');
const { userIdParamValidator } = require('../validators/profileValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/me/followers', authenticate, getMyFollowers);
router.get('/me/following', authenticate, getMyFollowing);
router.post('/:id/follow', authenticate, userIdParamValidator, validateRequest, followUser);
router.delete('/:id/follow', authenticate, userIdParamValidator, validateRequest, unfollowUser);
router.get('/:id/followers', userIdParamValidator, validateRequest, getFollowers);
router.get('/:id/following', userIdParamValidator, validateRequest, getFollowing);
router.get('/:id/is-following', authenticate, userIdParamValidator, validateRequest, isFollowing);

module.exports = router;