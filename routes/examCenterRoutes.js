const express = require('express');
const router = express.Router();
const {
  getCenters,
  createCenter,
  updateCenter,
  deleteCenter,
} = require('../controllers/examCenterController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { centerValidator, centerIdValidator } = require('../validators/workflowValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', authenticate, authorize('exam_admin', 'hallticket_admin', 'admin', 'superadmin'), getCenters);
router.post('/', authenticate, authorize('exam_admin', 'superadmin'), centerValidator, validateRequest, createCenter);
router.put('/:id', authenticate, authorize('exam_admin', 'superadmin'), centerIdValidator, validateRequest, centerValidator, validateRequest, updateCenter);
router.delete('/:id', authenticate, authorize('exam_admin', 'superadmin'), centerIdValidator, validateRequest, deleteCenter);

module.exports = router;
