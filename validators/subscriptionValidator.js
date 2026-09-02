const { body } = require('express-validator');

const subscribeValidator = [
  body('plan').isIn(['free', 'pro', 'company']).withMessage('Plan must be free, pro, or company'),
  body('months').optional().isInt({ min: 1, max: 12 }).withMessage('Months must be 1-12'),
];

const companyProfileValidator = [
  body('companyName').optional().trim().isLength({ min: 2, max: 100 }),
  body('website').optional().isURL().withMessage('Must be a valid URL'),
  body('industry').optional().trim().isLength({ max: 50 }),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-1000', '1000+']),
  body('description').optional().trim().isLength({ max: 500 }),
];

module.exports = { subscribeValidator, companyProfileValidator };
