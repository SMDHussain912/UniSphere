const Profile = require('../models/Profile');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const filterFields = (obj, allowed) => {
  const result = {};
  allowed.forEach((key) => {
    if (obj[key] !== undefined) result[key] = obj[key];
  });
  return result;
};

const PUBLIC_PROFILE_FIELDS = [
  'headline', 'bio', 'avatarUrl', 'coverUrl', 'location', 'website',
  'github', 'linkedin', 'skills', 'interests', 'experience', 'education',
  'availableForWork', 'visibility',
];

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id });
  return success(res, { data: profile });
});

const updateMyProfile = asyncHandler(async (req, res, next) => {
  const updates = filterFields(req.body, PUBLIC_PROFILE_FIELDS);
  const profile = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
  return success(res, { data: profile, message: 'Profile updated successfully.' });
});

const getPublicProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('fullname email role createdAt');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const profile = await Profile.findOne({ userId: req.params.id });
  if (!profile || profile.visibility === 'private') {
    return success(res, {
      data: {
        user: { fullname: user.fullname, email: user.email, role: user.role, createdAt: user.createdAt },
        profile: null,
      },
    });
  }
  return success(res, { data: { user, profile } });
});

const getMyStats = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id });
  return success(res, { data: profile });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  getMyStats,
};