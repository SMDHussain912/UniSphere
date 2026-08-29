const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Passed', 'Failed', 'Pending'],
      default: 'Pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        selectedOption: {
          type: Number,
          default: null,
        },
        correct: {
          type: Boolean,
          default: false,
        },
        marks: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

examResultSchema.index({ examId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
