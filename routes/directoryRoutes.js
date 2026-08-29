const express = require('express');
const router = express.Router();
const {
  getDirectory,
  getLeaderboard,
  getSkillSuggestions,
} = require('../controllers/directoryController');

router.get('/', getDirectory);
router.get('/leaderboard', getLeaderboard);
router.get('/skills', getSkillSuggestions);

module.exports = router;