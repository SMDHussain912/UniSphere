const News = require('../models/News');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc    Get all news
 * @route   GET /api/v1/news
 * @access  Public
 */
const getNews = asyncHandler(async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  return success(res, {
    data: news,
    message: 'News retrieved successfully.',
  });
});

/**
 * @desc    Get single news
 * @route   GET /api/v1/news/:id
 * @access  Public
 */
const getSingleNews = asyncHandler(async (req, res, next) => {
  const newsItem = await News.findById(req.params.id);

  if (!newsItem) {
    return next(
      new AppError('News not found', 404, `No news exists with id ${req.params.id}`)
    );
  }

  return success(res, { data: newsItem });
});

/**
 * @desc    Create news
 * @route   POST /api/v1/news
 * @access  Private (Admin only)
 */
const createNews = asyncHandler(async (req, res) => {
  const newsItem = await News.create(req.body);
  return success(res, {
    data: newsItem,
    message: 'News created successfully.',
    status: 201,
  });
});

/**
 * @desc    Update news
 * @route   PUT /api/v1/news/:id
 * @access  Private (Admin only)
 */
const updateNews = asyncHandler(async (req, res, next) => {
  const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!newsItem) {
    return next(
      new AppError('News not found', 404, `No news exists with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: newsItem,
    message: 'News updated successfully.',
  });
});

/**
 * @desc    Delete news
 * @route   DELETE /api/v1/news/:id
 * @access  Private (Admin only)
 */
const deleteNews = asyncHandler(async (req, res, next) => {
  const newsItem = await News.findByIdAndDelete(req.params.id);

  if (!newsItem) {
    return next(
      new AppError('News not found', 404, `No news exists with id ${req.params.id}`)
    );
  }

  return success(res, {
    data: newsItem,
    message: 'News deleted successfully.',
  });
});

module.exports = {
  getNews,
  getSingleNews,
  createNews,
  updateNews,
  deleteNews,
};
