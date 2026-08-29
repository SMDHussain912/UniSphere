const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    passed: { type: Boolean, default: false },
    output: { type: String, default: '' },
    points: { type: Number, default: 0 },
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const projectSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    repoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    demoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    code: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['submitted', 'testing', 'passed', 'failed', 'reviewed'],
      default: 'submitted',
    },
    testResults: {
      type: [testCaseResultSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    testedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

projectSubmissionSchema.index({ userId: 1, projectId: 1 });

module.exports = mongoose.model('ProjectSubmission', projectSubmissionSchema);