const Follow = require('../models/Follow');
const User = require('../models/User');
const Profile = require('../models/Profile');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const followUser = asyncHandler(async (req, res, next) => {
  const targetId = req.params.id;
  if (targetId === req.user.id) {
    return next(new AppError('You cannot follow yourself', 400));
  }
  const target = await User.findById(targetId);
  if (!target) {
    return next(new AppError('User not found', 404));
  }
  const existing = await Follow.findOne({ followerId: req.user.id, followingId: targetId });
  if (existing) {
    return next(new AppError('Already following this user', 400));
  }
  const follow = await Follow.create({ followerId: req.user.id, followingId: targetId });
  return success(res, { data: follow, message: 'Followed successfully.', status: 201 });
});

const unfollowUser = asyncHandler(async (req, res, next) => {
  const targetId = req.params.id;
  const deleted = await Follow.findOneAndDelete({ followerId: req.user.id, followingId: targetId });
  if (!deleted) {
    return next(new AppError('Not following this user', 404));
  }
  return success(res, { message: 'Unfollowed successfully.' });
});

const getFollowers = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followingId: req.params.id })
    .populate('followerId', 'fullname')
    .sort({ createdAt: -1 });
  return success(res, { data: follows.map((f) => f.followerId) });
});

const getFollowing = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followerId: req.params.id })
    .populate('followingId', 'fullname')
    .sort({ createdAt: -1 });
  return success(res, { data: follows.map((f) => f.followingId) });
});

const getMyFollowers = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followingId: req.user.id })
    .populate('followerId', 'fullname')
    .sort({ createdAt: -1 });
  return success(res, { data: follows.map((f) => f.followerId) });
});

const getMyFollowing = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followerId: req.user.id })
    .populate('followingId', 'fullname')
    .sort({ createdAt: -1 });
  return success(res, { data: follows.map((f) => f.followingId) });
});

const isFollowing = asyncHandler(async (req, res) => {
  const existing = await Follow.findOne({ followerId: req.user.id, followingId: req.params.id });
  return success(res, { data: { following: !!existing } });
});

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getMyFollowers,
  getMyFollowing,
  isFollowing,
};