const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'Descriptive'],
      default: 'MCQ',
    },
    options: {
      type: [String],
      validate: {
        validator: function (value) {
          if (this.questionType === 'Descriptive') return true;
          return Array.isArray(value) && value.length >= 2 && value.length <= 6;
        },
        message: 'Options must contain between 2 and 6 choices',
      },
    },
    correctAnswer: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          if (this.questionType === 'Descriptive') return true;
          return Number.isInteger(value) && value >= 0;
        },
        message: 'Correct answer index is required for MCQ questions',
      },
    },
    marks: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ examId: 1, createdAt: 1 });

module.exports = mongoose.model('Question', questionSchema);
