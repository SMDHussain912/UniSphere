const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },

    /* ================= INTERNSHIP DETAILS ================= */
    organization: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    stipend: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    endingDate: {
      type: Date,
      default: null,
    },
    skillsLearned: {
      type: String,
      required: [true, 'Skills learned is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Internship', internshipSchema);
