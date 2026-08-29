const express = require('express');
const router = express.Router();
const {
  getGraph,
  getSkillDetail,
  getRecommendations,
} = require('../controllers/skillGraphController');
const { authenticate } = require('../middlewares/authMiddleware');
const { skillKeyParamValidator } = require('../validators/skillValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', getGraph);
router.get('/recommendations', authenticate, getRecommendations);
router.get('/:key', skillKeyParamValidator, validateRequest, getSkillDetail);

module.exports = router;