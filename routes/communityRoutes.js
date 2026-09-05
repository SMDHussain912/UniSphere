const express = require('express');
const router = express.Router();
const {
  getCommunities,
  getCommunity,
  createCommunity,
  getDiscussions,
  getDiscussion,
  createDiscussion,
  addAnswer,
} = require('../controllers/communityController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  communityValidator,
  discussionValidator,
  answerValidator,
  discussionIdValidator,
  communitySlugValidator,
} = require('../validators/communityValidator');
const validateRequest = require('../middlewares/validateRequest');

// Public listings
router.get('/communities', getCommunities);
router.get('/communities/:slug', communitySlugValidator, validateRequest, getCommunity);
router.get('/discussions', getDiscussions);
router.get('/discussions/:id', discussionIdValidator, validateRequest, getDiscussion);

// Write operations require authentication
router.post('/communities', authenticate, communityValidator, validateRequest, createCommunity);
router.post('/discussions', authenticate, discussionValidator, validateRequest, createDiscussion);
router.post(
  '/discussions/:id/answers',
  authenticate,
  discussionIdValidator,
  validateRequest,
  answerValidator,
  validateRequest,
  addAnswer
);

module.exports = router;