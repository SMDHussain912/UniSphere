const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    /* ================= JOB ================= */
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },

    /* ================= GENERAL ================= */
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    adhaar: {
      type: String,
      required: [true, 'Aadhaar number is required'],
      unique: true,
      trim: true,
      match: [/^\d{12}$/, 'Aadhaar must be 12 digits'],
    },
    mobileno: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    parentstatus: {
      type: String,
      enum: ['both', 'father', 'mother', 'orphan'],
      required: [true, 'Parent status is required'],
    },
    fathername: {
      type: String,
      default: null,
    },
    mothername: {
      type: String,
      default: null,
    },
    gurdianname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },

    /* ================= CATEGORY ================= */
    category: {
      type: String,
      enum: ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS'],
      required: [true, 'Category is required'],
    },

    annualincome: {
      type: Number,
      default: 0,
    },
    identificationmark1: {
      type: String,
      default: null,
    },
    identificationmark2: {
      type: String,
      default: null,
    },
    fulladdress: {
      type: String,
      default: null,
    },

    /* ================= EDUCATION ================= */
    education: {
      ssc: {
        board: {
          type: String,
          default: null,
        },
        percentage: {
          type: Number,
          default: null,
        },
      },
      intermediateOrDiploma: {
        type: String,
        enum: ['intermediate', 'diploma', 'none'],
        default: 'none',
      },
      intermediate: {
        collegename: {
          type: String,
          default: null,
        },
        percentage: {
          type: Number,
          default: null,
        },
        passedoutyear: {
          type: Number,
          default: null,
        },
      },
      diploma: {
        collegename: {
          type: String,
          default: null,
        },
        percentage: {
          type: Number,
          default: null,
        },
        passedoutyear: {
          type: Number,
          default: null,
        },
      },
      higherStudies: {
        stype: {
          type: String,
          enum: ['degree', 'btech', 'mtech', 'other', 'none'],
          default: 'none',
        },
        specialotherstudy: {
          type: String,
          default: null,
        },
        universityname: {
          type: String,
          default: null,
        },
        percentage: {
          type: String,
          default: null,
        },
        branch: {
          type: String,
          default: null,
        },
        passedoutyear: {
          type: Number,
          default: null,
        },
      },
    },

    /* ================= EXPERIENCE ================= */
    applicanttype: {
      type: String,
      default: null,
    },
    internshipExperience: {
      type: String,
      default: null,
    },
    noofinternshipcompanies: {
      type: Number,
      default: 0,
    },
    noofcompaniesworked: {
      type: Number,
      default: 0,
    },

    /* ================= DOCUMENTS ================= */
    documents: {
      identityProof: { type: String, default: null },
      sscMarksMemo: { type: String, default: null },
      recentExaminationMarksMemo: { type: String, default: null },
      incomeCertificate: { type: String, default: null },
      casteCertificate: { type: String, default: null },
      passportPhoto: { type: String, default: null },
      signature: { type: String, default: null },
      resume: { type: String, default: null },
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
    },

    adminMessage: {
      type: String,
      default: null,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
