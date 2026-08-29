const mongoose = require('mongoose');

const hallTicketSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamEnrollment',
      required: [true, 'Enrollment ID is required'],
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    hallTicketNumber: {
      type: String,
      required: [true, 'Hall ticket number is required'],
      unique: true,
      trim: true,
    },
    venue: {
      type: String,
      default: null,
    },
    examDate: {
      type: Date,
      default: null,
    },
    session: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
      default: 'Morning',
    },
    photo: {
      type: String,
      default: null,
    },
    signature: {
      type: String,
      default: null,
    },
    qrText: {
      type: String,
      default: null,
    },
    issueCount: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['issued', 'reprinted', 'cancelled'],
      default: 'issued',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HallTicket', hallTicketSchema);
