const { body, param } = require('express-validator');

const conversationValidator = [
  body('participantId').isMongoId().withMessage('Invalid participant ID'),
];

const messageParamsValidator = [
  param('id').isMongoId().withMessage('Invalid conversation ID'),
];

const messageValidator = [
  param('id').isMongoId().withMessage('Invalid conversation ID'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
];

module.exports = { conversationValidator, messageParamsValidator, messageValidator };