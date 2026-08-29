const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    organization: {
      type: String,
      default: 'UniSphere',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technology', 'Operations', 'Sales', 'Support', 'Other'],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      required: [true, 'Job status is required'],
      default: 'Active',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
    },
    experienceRequired: {
      type: String,
      default: 'Fresher',
    },
    salary: {
      type: String,
      default: 'Negotiable',
    },
    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },
    employmentType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Contract', 'Internship'],
      default: 'Full Time',
    },
    skills: {
      type: [String],
      default: [],
    },
    lastDate: {
      type: Date,
      required: [true, 'Last date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);
