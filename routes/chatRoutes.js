const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  conversationValidator,
  messageParamsValidator,
  messageValidator,
} = require('../validators/chatValidator');
const validateRequest = require('../middlewares/validateRequest');

// All chat routes require authentication
router.use(authenticate);

router.get('/conversations', getConversations);
router.post('/conversations', conversationValidator, validateRequest, getOrCreateConversation);
router.get(
  '/conversations/:id/messages',
  messageParamsValidator,
  validateRequest,
  getMessages
);
router.post(
  '/conversations/:id/messages',
  messageValidator,
  validateRequest,
  sendMessage
);

module.exports = router;