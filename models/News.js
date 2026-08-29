const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'News category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'News description is required'],
    },
    date: {
      type: Date,
      required: [true, 'News date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('News', newsSchema);
