const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Evidence type is required'],
      enum: ['course_completed', 'exercise', 'project', 'assessment', 'external', 'certification'],
    },
    title: {
      type: String,
      required: [true, 'Evidence title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    source: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    count: {
      type: Number,
      default: 1,
      min: 1,
    },
    earnedPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const userSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    skillKey: {
      type: String,
      required: [true, 'Skill key is required'],
      trim: true,
      lowercase: true,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    evidence: {
      type: [evidenceSchema],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSkillSchema.index({ userId: 1, skillKey: 1 }, { unique: true });
userSkillSchema.index({ skillKey: 1, level: -1 });

module.exports = mongoose.model('UserSkill', userSkillSchema);