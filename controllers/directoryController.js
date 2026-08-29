const User = require('../models/User');
const Profile = require('../models/Profile');
const Follow = require('../models/Follow');
const CourseProgress = require('../models/CourseProgress');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const getDirectory = asyncHandler(async (req, res) => {
  const { q, skill, available, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const profileMatch = { visibility: { $ne: 'private' } };
  if (skill) profileMatch.skills = { $in: [skill] };
  if (available === 'true') profileMatch.availableForWork = true;

  const userMatch = {};
  if (q) {
    userMatch.$or = [
      { 'fullname.firstname': { $regex: q, $options: 'i' } },
      { 'fullname.lastname': { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const [profiles, total] = await Promise.all([
    Profile.find(profileMatch)
      .populate({
        path: 'userId',
        match: userMatch,
        select: 'fullname email role createdAt',
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Profile.countDocuments(profileMatch),
  ]);

  const filtered = profiles.filter((p) => p.userId !== null);

  return success(res, {
    data: {
      learners: filtered.map((p) => ({
        id: p.userId._id,
        fullname: p.userId.fullname,
        email: p.userId.email,
        headline: p.headline,
        location: p.location,
        skills: p.skills,
        availableForWork: p.availableForWork,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find({ role: 'user' })
      .select('fullname email points badges')
      .sort({ points: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments({ role: 'user' }),
  ]);

  return success(res, {
    data: {
      leaders: users.map((u, idx) => ({
        rank: skip + idx + 1,
        id: u._id,
        fullname: u.fullname,
        points: u.points,
        badges: u.badges,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

const getSkillSuggestions = asyncHandler(async (req, res) => {
  const skills = await Profile.distinct('skills', { visibility: { $ne: 'private' } });
  return success(res, { data: skills.sort() });
});

module.exports = {
  getDirectory,
  getLeaderboard,
  getSkillSuggestions,
};