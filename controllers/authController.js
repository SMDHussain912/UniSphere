const bcrypt = require('bcrypt');
const svgcaptcha = require('svg-captcha');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendTokenResponse } = require('../utils/generateToken');
const config = require('../config/env');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Generate CAPTCHA and store in session
 * @route   GET /api/v1/auth/captcha
 * @access  Public
 */
const generateCaptcha = asyncHandler(async (req, res) => {
  const captcha = svgcaptcha.create({
    size: 4,
    noise: 2,
    width: 220,
    height: 64,
    fontSize: 60,
    color: true,
    ignoreChars: '0Oo1ilI',
    charPreset:
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
  });

  req.session.captcha = captcha.text;
  res.type('svg').send(captcha.data);
});

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  // Verify captcha
  if (req.body.captcha !== req.session.captcha) {
    return next(new AppError('Captcha is incorrect', 400));
  }

  const { firstname, lastname, email, phone, dob, gender, qualification, password } =
    req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  }).select('+password');

  if (existingUser) {
    return next(
      new AppError('User already exists with this email or phone number', 400)
    );
  }

  const user = await User.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    phone,
    dob,
    gender,
    qualification,
    password,
    role: 'user',
  });

  // Clear captcha after use
  delete req.session.captcha;

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password, captcha } = req.body;

  // Verify captcha
  if (captcha !== req.session.captcha) {
    return next(new AppError('Invalid captcha', 400));
  }

  // Check if user exists (select password since it's excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('User does not exist. Please register.', 401));
  }

  // Check password
  const validPassword = await user.comparePassword(password);

  if (!validPassword) {
    return next(new AppError('Incorrect password', 401));
  }

  if (user.active === false) {
    return next(
      new AppError('This account has been deactivated. Contact the super admin.', 403)
    );
  }

  // Clear captcha after use
  delete req.session.captcha;

  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  if (req.session) {
    req.session.destroy();
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.fullname.firstname = req.body.firstname || user.fullname.firstname;
  user.fullname.lastname = req.body.lastname || user.fullname.lastname;
  user.phone = req.body.phone || user.phone;
  user.gender = req.body.gender || user.gender;
  user.qualification = req.body.qualification || user.qualification;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user,
    },
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const validPassword = await user.comparePassword(currentPassword);

  if (!validPassword) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

module.exports = {
  generateCaptcha,
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
