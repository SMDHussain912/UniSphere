const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Snippet title is required'],
      trim: true,
      maxlength: 120,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

snippetSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Snippet', snippetSchema);