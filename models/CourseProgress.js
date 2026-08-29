const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    courseSlug: {
      type: String,
      required: [true, 'Course slug is required'],
      trim: true,
      lowercase: true,
    },
    completedLessons: {
      type: [String],
      default: [],
    },
    percent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

courseProgressSchema.index({ userId: 1, courseSlug: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);