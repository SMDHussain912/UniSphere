const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (7 * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      message,
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
};

module.exports = { generateToken, sendTokenResponse };
