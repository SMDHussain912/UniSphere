const { body, param } = require('express-validator');

const applicationValidator = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid job ID'),
  body('fullname')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('adhaar')
    .trim()
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar must be 12 digits')
    .isNumeric()
    .withMessage('Aadhaar must be numeric'),
  body('mobileno')
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be 10 digits')
    .isNumeric()
    .withMessage('Mobile number must be numeric'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),
  body('parentstatus')
    .isIn(['both', 'father', 'mother', 'orphan'])
    .withMessage('Please select a valid parent status'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('category')
    .isIn(['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS'])
    .withMessage('Please select a valid category'),
  body('annualincome')
    .optional()
    .isNumeric()
    .withMessage('Annual income must be a number'),
  body('fulladdress')
    .trim()
    .notEmpty()
    .withMessage('Full address is required'),
];

const applicationIdValidator = [
  param('id').isMongoId().withMessage('Invalid application ID'),
];

module.exports = { applicationValidator, applicationIdValidator };
