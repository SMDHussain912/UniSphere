const { body } = require('express-validator');

const passwordStrengthCheck = (value, { req }) => {
  let strength = 0;
  if (/[A-Z]/.test(value)) strength++;
  if (/[0-9]/.test(value)) strength++;
  if (/[a-z]/.test(value)) strength++;
  if (/[@$!%*?&]/.test(value)) strength++;
  if (strength < 3) {
    throw new Error(
      'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters'
    );
  }
  return true;
};

const registerValidator = [
  body('firstname')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('First name must be between 3 and 30 characters'),
  body('lastname')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Last name must be between 3 and 30 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid 10-digit phone number'),
  body('dob').notEmpty().withMessage('Date of birth is required'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Please select a valid gender'),
  body('qualification')
    .isIn(['10th Pass', '12th Pass', 'Diploma', 'Degree', 'B.Tech'])
    .withMessage('Please select a valid qualification'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .custom(passwordStrengthCheck),
  body('captcha').notEmpty().withMessage('Captcha is required'),
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  body('captcha').notEmpty().withMessage('Captcha is required'),
];

const updateProfileValidator = [
  body('firstname')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('First name must be between 3 and 30 characters'),
  body('lastname')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Last name must be between 3 and 30 characters'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid 10-digit phone number'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Please select a valid gender'),
  body('qualification')
    .optional()
    .isIn(['10th Pass', '12th Pass', 'Diploma', 'Degree', 'B.Tech'])
    .withMessage('Please select a valid qualification'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .custom(passwordStrengthCheck),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
};
