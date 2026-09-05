const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Answer author is required'],
    },
    content: {
      type: String,
      required: [true, 'Answer content is required'],
      trim: true,
      maxlength: [5000, 'Answer cannot exceed 5000 characters'],
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Discussion title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [60, 'Category cannot exceed 60 characters'],
    },
    body: {
      type: String,
      required: [true, 'Discussion body is required'],
      maxlength: [20000, 'Body cannot exceed 20000 characters'],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);