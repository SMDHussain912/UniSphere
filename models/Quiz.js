const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2 && value.length <= 6,
        message: 'Options must contain between 2 and 6 choices',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer is required'],
      min: 0,
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Quiz key is required'],
      unique: true,
      trim: true,
    },
    courseSlug: {
      type: String,
      required: [true, 'Course slug is required'],
      index: true,
    },
    moduleId: {
      type: Number,
      required: [true, 'Module ID is required'],
      min: 0,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    questions: {
      type: [quizQuestionSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Quiz requires at least one question',
      },
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    passPercent: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', quizSchema);