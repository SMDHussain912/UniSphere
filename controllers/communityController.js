const Community = require('../models/Community');
const Discussion = require('../models/Discussion');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);

/** Generate a unique slug by appending -2, -3, ... while collisions exist. */
const uniqueSlug = async (Model, base) => {
  let slug = base || 'item';
  let n = 2;
  while (await Model.exists({ slug })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
};

/**
 * @desc    Get communities (public listing)
 * @route   GET /api/v1/community/communities
 * @access  Public
 */
const getCommunities = asyncHandler(async (req, res) => {
  const communities = await Community.find().sort({ members: -1 }).limit(50);
  return success(res, { data: { communities }, message: 'Communities retrieved successfully.' });
});

/**
 * @desc    Create a community
 * @route   POST /api/v1/community/communities
 * @access  Private
 */
const createCommunity = asyncHandler(async (req, res) => {
  const { name, description = '' } = req.body;
  const slug = await uniqueSlug(Community, slugify(name));
  const community = await Community.create({
    name,
    slug,
    description,
    createdBy: req.user._id,
  });
  return success(res, { data: community, message: 'Community created successfully.', status: 201 });
});

/**
 * @desc    Get discussions (public listing)
 * @route   GET /api/v1/community/discussions
 * @access  Public
 */
const getDiscussions = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = {};
  if (category) query.category = category;

  const discussions = await Discussion.find(query)
    .populate('authorId', 'fullname')
    .sort({ createdAt: -1 })
    .limit(100);

  return success(res, { data: { discussions }, message: 'Discussions retrieved successfully.' });
});

/**
 * @desc    Get a single discussion (public)
 * @route   GET /api/v1/community/discussions/:id
 * @access  Public
 */
const getDiscussion = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id)
    .populate('authorId', 'fullname')
    .populate('answers.authorId', 'fullname');

  if (!discussion) {
    return next(new AppError('Discussion not found', 404));
  }

  return success(res, { data: discussion });
});

/**
 * @desc    Create a discussion
 * @route   POST /api/v1/community/discussions
 * @access  Private
 */
const createDiscussion = asyncHandler(async (req, res, next) => {
  const { title, category, body } = req.body;

  if (!title || !category || !body) {
    return next(new AppError('Title, category and body are required', 400));
  }

  const slug = await uniqueSlug(Discussion, slugify(title));
  const discussion = await Discussion.create({
    title,
    slug,
    category,
    body,
    authorId: req.user._id,
  });
  await discussion.populate('authorId', 'fullname');

  return success(res, { data: discussion, message: 'Discussion created successfully.', status: 201 });
});

/**
 * @desc    Add an answer to a discussion
 * @route   POST /api/v1/community/discussions/:id/answers
 * @access  Private
 */
const addAnswer = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) {
    return next(new AppError('Discussion not found', 404));
  }

  const content = (req.body.content || '').trim();
  if (!content) {
    return next(new AppError('Answer content is required', 400));
  }

  discussion.answers.push({ authorId: req.user._id, content });
  await discussion.save();
  await discussion.populate('answers.authorId', 'fullname');

  return success(res, { data: discussion, message: 'Answer added successfully.', status: 201 });
});

module.exports = {
  getCommunities,
  createCommunity,
  getDiscussions,
  getDiscussion,
  createDiscussion,
  addAnswer,
};