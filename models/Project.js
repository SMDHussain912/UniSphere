const mongoose = require('mongoose');

const testCriteriaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    command: {
      type: String,
      required: [true, 'Test command is required'],
      trim: true,
    },
    expectedOutput: {
      type: String,
      default: '',
    },
    points: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    skillKeys: {
      type: [String],
      default: [],
    },
    starterCode: {
      type: String,
      default: '',
    },
    starterRepoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    testCriteria: {
      type: [testCriteriaSchema],
      default: [],
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedHours: {
      type: Number,
      default: 1,
      min: 1,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ skillKeys: 1 });
projectSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Project', projectSchema);