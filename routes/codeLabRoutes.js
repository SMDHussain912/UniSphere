const express = require('express');
const router = express.Router();
const {
  runCode,
  saveSnippet,
  getMySnippets,
  getSnippet,
  updateSnippet,
  deleteSnippet,
  getPublicSnippets,
} = require('../controllers/codeLabController');
const { authenticate } = require('../middlewares/authMiddleware');
const { runCodeLimiter } = require('../middlewares/rateLimiters');
const {
  runCodeValidator,
  snippetValidator,
  snippetUpdateValidator,
  snippetIdValidator,
} = require('../validators/labValidator');
const validateRequest = require('../middlewares/validateRequest');

router.post('/run', authenticate, runCodeLimiter, runCodeValidator, validateRequest, runCode);

router.get('/snippets', authenticate, getMySnippets);
router.get('/snippets/public', getPublicSnippets);
router.post('/snippets', authenticate, snippetValidator, validateRequest, saveSnippet);
router.get('/snippets/:id', authenticate, snippetIdValidator, validateRequest, getSnippet);
router.put('/snippets/:id', authenticate, snippetIdValidator, validateRequest, snippetUpdateValidator, validateRequest, updateSnippet);
router.delete('/snippets/:id', authenticate, snippetIdValidator, validateRequest, deleteSnippet);

router.get('/languages', authenticate, (req, res) => {
  const dr = require('../utils/dockerRunner');
  res.json({ languages: Object.keys(dr.LANGUAGE_IMAGES) });
});

module.exports = router;
