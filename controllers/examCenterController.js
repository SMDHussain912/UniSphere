const ExamCenter = require('../models/ExamCenter');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const getCenters = asyncHandler(async (req, res) => {
  const { city, status, page = 1, limit = 50 } = req.query;
  const query = {};
  if (city) query.city = city;
  if (status && status !== 'all') query.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [centers, total] = await Promise.all([
    ExamCenter.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    ExamCenter.countDocuments(query),
  ]);
  return success(res, {
    data: { centers, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalItems: total, itemsPerPage: parseInt(limit) } },
    message: 'Exam centers retrieved successfully.',
  });
});

const createCenter = asyncHandler(async (req, res, next) => {
  const exists = await ExamCenter.findOne({ code: req.body.code });
  if (exists) return next(new AppError('A center with this code already exists', 400));
  const center = await ExamCenter.create(req.body);
  return success(res, { data: center, message: 'Exam center created successfully.', status: 201 });
});

const updateCenter = asyncHandler(async (req, res, next) => {
  const center = await ExamCenter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!center) return next(new AppError('Exam center not found', 404));
  return success(res, { data: center, message: 'Exam center updated successfully.' });
});

const deleteCenter = asyncHandler(async (req, res, next) => {
  const center = await ExamCenter.findByIdAndDelete(req.params.id);
  if (!center) return next(new AppError('Exam center not found', 404));
  return success(res, { data: center, message: 'Exam center deleted successfully.' });
});

module.exports = { getCenters, createCenter, updateCenter, deleteCenter };
