const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    coverUrl: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    github: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    education: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    availableForWork: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);