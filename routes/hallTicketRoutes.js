const express = require('express');
const router = express.Router();
const {
  generateHallTicket,
  listHallTickets,
  getMyHallTickets,
  getHallTicket,
} = require('../controllers/hallTicketController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { hallTicketGenerateValidator } = require('../validators/workflowValidator');
const validateRequest = require('../middlewares/validateRequest');

router.get('/hall-tickets/mine', authenticate, getMyHallTickets);
router.get('/hall-tickets/:id', authenticate, getHallTicket);

router.get('/admin/hall-tickets', authenticate, authorize('hallticket_admin', 'admin', 'superadmin'), listHallTickets);
router.post('/admin/hall-tickets/generate', authenticate, authorize('hallticket_admin', 'superadmin'), hallTicketGenerateValidator, validateRequest, generateHallTicket);

module.exports = router;
