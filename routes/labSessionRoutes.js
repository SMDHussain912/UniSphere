const express = require('express');
const router = express.Router();
const {
  getMySessions,
  getActiveSession,
  createSession,
  stopSession,
} = require('../controllers/labSessionController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  sessionTypeValidator,
  sessionIdValidator,
} = require('../validators/labValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', authenticate, getMySessions);
router.get('/active', authenticate, getActiveSession);
router.post('/', authenticate, sessionTypeValidator, validateRequest, createSession);
router.post('/:id/stop', authenticate, sessionIdValidator, validateRequest, stopSession);

module.exports = router;