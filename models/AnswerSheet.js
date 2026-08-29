const mongoose = require('mongoose');

const answerSheetSchema = new mongoose.Schema(
  {
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
    examResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamResult',
      default: null,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionPaper',
      default: null,
    },
    autoScore: {
      type: Number,
      default: 0,
    },
    manualMarks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending',
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        text: {
          type: String,
          default: null,
        },
        file: {
          type: String,
          default: null,
        },
        awarded: {
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

answerSheetSchema.index({ examId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('AnswerSheet', answerSheetSchema);
