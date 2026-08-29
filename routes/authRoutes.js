const express = require('express');
const router = express.Router();
const {
  generateCaptcha,
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require('../validators/authValidator');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/authMiddleware');

// Captcha (public)
router.get('/captcha', generateCaptcha);

// Auth (public)
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

// Auth (private)
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put(
  '/profile',
  authenticate,
  updateProfileValidator,
  validateRequest,
  updateProfile
);
router.post(
  '/change-password',
  authenticate,
  changePasswordValidator,
  validateRequest,
  changePassword
);

module.exports = router;
