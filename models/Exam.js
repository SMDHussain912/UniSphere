const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    organization: {
      type: String,
      default: 'UniSphere',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Exam description is required'],
    },
    category: {
      type: String,
      required: [true, 'Exam category is required'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    examType: {
      type: String,
      enum: ['MCQ', 'Descriptive', 'Mixed'],
      default: 'MCQ',
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: 1,
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks is required'],
      min: 0,
    },
    vacancies: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    examDate: {
      type: Date,
      default: null,
    },
    lastDate: {
      type: Date,
      required: [true, 'Last date is required'],
    },
    syllabus: {
      type: String,
      default: '',
    },
    examPattern: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Closed'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exam', examSchema);
