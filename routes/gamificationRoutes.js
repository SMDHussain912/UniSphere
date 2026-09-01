const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getUserLevel,
  getUserAchievements,
  getGlobalLeaderboard,
  getPerSkillLeaderboard,
  getPortfolio,
} = require('../controllers/gamificationController');

const router = express.Router();

router.get('/my/level', authenticate, getUserLevel);
router.get('/my/achievements', authenticate, getUserAchievements);
router.get('/leaderboard', getGlobalLeaderboard);
router.get('/leaderboard/skill/:skillKey', getPerSkillLeaderboard);
router.get('/portfolio/:userId', getPortfolio);
router.get('/portfolio', authenticate, getPortfolio);

module.exports = router;