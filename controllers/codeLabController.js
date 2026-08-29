const config = require('../config/env');
const dockerRunner = require('../utils/dockerRunner');
const Snippet = require('../models/Snippet');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const RUN_CONCURRENT = new Map();

const runCode = asyncHandler(async (req, res, next) => {
  if (!config.labEnabled) {
    return next(new AppError('Lab is currently disabled', 503));
  }

  const { language, code, input } = req.body;
  if (!code || typeof code !== 'string') {
    return next(new AppError('Code is required', 400));
  }

  if (RUN_CONCURRENT.size >= config.runConcurrency) {
    return next(new AppError('Server is at capacity. Try again shortly.', 429));
  }

  const userId = req.user.id;
  RUN_CONCURRENT.set(userId, true);

  try {
    const result = await dockerRunner.runCode({ language, code, input });
    return success(res, {
      data: { output: result.output, language },
      message: 'Code executed successfully.',
    });
  } finally {
    RUN_CONCURRENT.delete(userId);
  }
});

const saveSnippet = asyncHandler(async (req, res) => {
  const { title, language, code, isPublic } = req.body;
  const snippet = await Snippet.create({
    userId: req.user.id,
    title,
    language,
    code: code || '',
    isPublic: !!isPublic,
  });
  return success(res, { data: snippet, message: 'Snippet saved successfully.', status: 201 });
});

const getMySnippets = asyncHandler(async (req, res) => {
  const snippets = await Snippet.find({ userId: req.user.id }).sort({ updatedAt: -1 });
  return success(res, { data: snippets, message: 'Snippets retrieved successfully.' });
});

const getSnippet = asyncHandler(async (req, res, next) => {
  const snippet = await Snippet.findById(req.params.id);
  if (!snippet) {
    return next(new AppError('Snippet not found', 404));
  }
  if (!snippet.isPublic && snippet.userId.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this snippet', 403));
  }
  return success(res, { data: snippet, message: 'Snippet retrieved successfully.' });
});

const updateSnippet = asyncHandler(async (req, res, next) => {
  const snippet = await Snippet.findOne({ _id: req.params.id, userId: req.user.id });
  if (!snippet) {
    return next(new AppError('Snippet not found', 404));
  }
  const { title, language, code, isPublic } = req.body;
  if (title !== undefined) snippet.title = title;
  if (language !== undefined) snippet.language = language;
  if (code !== undefined) snippet.code = code;
  if (isPublic !== undefined) snippet.isPublic = isPublic;
  await snippet.save();
  return success(res, { data: snippet, message: 'Snippet updated successfully.' });
});

const deleteSnippet = asyncHandler(async (req, res, next) => {
  const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!snippet) {
    return next(new AppError('Snippet not found', 404));
  }
  return success(res, { data: snippet, message: 'Snippet deleted successfully.' });
});

const getPublicSnippets = asyncHandler(async (req, res) => {
  const snippets = await Snippet.find({ isPublic: true }).sort({ updatedAt: -1 }).limit(50);
  return success(res, { data: snippets, message: 'Public snippets retrieved successfully.' });
});

module.exports = {
  runCode,
  saveSnippet,
  getMySnippets,
  getSnippet,
  updateSnippet,
  deleteSnippet,
  getPublicSnippets,
};