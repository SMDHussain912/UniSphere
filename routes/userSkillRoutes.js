const express = require('express');
const router = express.Router();
const {
  getMySkills,
  addEvidence,
  getMySkillDetail,
  removeEvidence,
} = require('../controllers/userSkillController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  evidenceValidator,
  skillKeyParamValidator,
  evidenceIdParamValidator,
} = require('../validators/skillValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', authenticate, getMySkills);
router.get('/:key', authenticate, skillKeyParamValidator, validateRequest, getMySkillDetail);
router.post('/:key/evidence', authenticate, evidenceValidator, validateRequest, addEvidence);
router.delete(
  '/:key/evidence/:evidenceId',
  authenticate,
  evidenceIdParamValidator,
  validateRequest,
  removeEvidence
);

module.exports = router;