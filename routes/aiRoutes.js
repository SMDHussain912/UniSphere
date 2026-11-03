const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/authMiddleware');

// AI Chat endpoint
router.post('/chat', authenticate, aiController.chat);

// Conversation history
router.get('/conversations', authenticate, aiController.getConversations);
router.get('/conversations/:id', authenticate, aiController.getConversation);

// Lesson explanation
router.post('/lessons/:lessonId/explain', authenticate, aiController.lessonExplain);

// Quiz generation
router.post('/quizzes/generate', authenticate, aiController.quizGenerate);

// Challenge hint
router.post('/challenges/:challengeId/hint', authenticate, aiController.challengeHint);

// Code explanation
router.post('/code/explain', authenticate, aiController.codeExplain);

// AI usage tracking
router.get('/usage', authenticate, aiController.getUsage);

module.exports = router;