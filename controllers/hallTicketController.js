const mongoose = require('mongoose');
const HallTicket = require('../models/HallTicket');
const ExamEnrollment = require('../models/ExamEnrollment');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const nextHallTicketNumber = async () => {
  const doc = await mongoose.connection.db.collection('counters').findOneAndUpdate(
    { name: 'hallticket' },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  const value = doc && (doc.value !== undefined ? doc.value.value : doc.value);
  return `UHT${String(value || 1).padStart(6, '0')}`;
};

const generateHallTicket = asyncHandler(async (req, res, next) => {
  const { enrollmentId } = req.body;
  if (!enrollmentId) return next(new AppError('Enrollment ID is required', 400));

  const enrollment = await ExamEnrollment.findById(enrollmentId)
    .populate('examId', 'title organization examDate')
    .populate('centerId', 'name city address');

  if (!enrollment) return next(new AppError('Enrollment not found', 404));
  if (enrollment.status !== 'confirmed') {
    return next(new AppError('Hall ticket can be generated only for confirmed enrollments', 400));
  }

  const existing = await HallTicket.findOne({ enrollmentId });
  if (existing) {
    existing.issueCount += 1;
    existing.status = 'reprinted';
    await existing.save();
    return success(res, { data: existing, message: 'Hall ticket reissued successfully.' });
  }

  const number = await nextHallTicketNumber();
  const formData = enrollment.formData || {};
  const hallTicket = await HallTicket.create({
    enrollmentId: enrollment._id,
    userId: enrollment.userId,
    examId: enrollment.examId,
    hallTicketNumber: number,
    venue: enrollment.centerId ? `${enrollment.centerId.name}, ${enrollment.centerId.city}` : null,
    examDate: enrollment.examId ? enrollment.examId.examDate : null,
    photo: formData.photo || null,
    signature: formData.signature || null,
    qrText: JSON.stringify({ hallTicketNumber: number, enrollmentId: enrollment._id.toString() }),
    status: 'issued',
  });

  return success(res, { data: hallTicket, message: 'Hall ticket generated successfully.', status: 201 });
});

const listHallTickets = asyncHandler(async (req, res) => {
  const { status, examId, page = 1, limit = 15 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (examId) query.examId = examId;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [tickets, total] = await Promise.all([
    HallTicket.find(query)
      .populate('userId', 'fullname email phone')
      .populate('examId', 'title organization examDate')
      .populate('enrollmentId', 'registrationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    HallTicket.countDocuments(query),
  ]);
  return success(res, {
    data: { tickets, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalItems: total, itemsPerPage: parseInt(limit) } },
    message: 'Hall tickets retrieved successfully.',
  });
});

const getMyHallTickets = asyncHandler(async (req, res) => {
  const tickets = await HallTicket.find({ userId: req.user._id })
    .populate('examId', 'title organization examDate')
    .populate('enrollmentId', 'registrationNumber')
    .sort({ createdAt: -1 });
  return success(res, { data: tickets, message: 'Hall tickets retrieved successfully.' });
});

const getHallTicket = asyncHandler(async (req, res, next) => {
  const ticket = await HallTicket.findOne({ _id: req.params.id })
    .populate('userId', 'fullname email phone dob gender')
    .populate('examId', 'title organization examDate durationMinutes')
    .populate('enrollmentId', 'registrationNumber');

  if (!ticket) return next(new AppError('Hall ticket not found', 404));

  if (req.user.role === 'user' && ticket.userId._id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to view this hall ticket', 403));
  }

  return success(res, { data: ticket });
});

module.exports = { generateHallTicket, listHallTickets, getMyHallTickets, getHallTicket };
