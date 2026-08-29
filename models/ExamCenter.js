const mongoose = require('mongoose');

const examCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Center name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Center code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Center address is required'],
    },
    city: {
      type: String,
      required: [true, 'Center city is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      default: 100,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ExamCenter', examCenterSchema);
