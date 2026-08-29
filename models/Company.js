const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    /* ================= RELATIONS ================= */
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },

    /* ================= COMPANY DETAILS ================= */
    organization: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    totalExperience: {
      type: String,
      required: [true, 'Total experience is required'],
    },
    currentSalary: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    relievingDate: {
      type: Date,
      default: null,
    },
    employmentType: {
      type: String,
      enum: ['Full Time', 'Contract', 'Temporary', 'Outsourcing'],
      required: [true, 'Employment type is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    rolesResponsibilities: {
      type: String,
      required: [true, 'Roles and responsibilities are required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);
