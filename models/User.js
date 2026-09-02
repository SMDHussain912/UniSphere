const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/env');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [3, 'First name must be at least 3 characters'],
        maxlength: [30, 'First name cannot exceed 30 characters'],
      },
      lastname: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [3, 'Last name must be at least 3 characters'],
        maxlength: [30, 'Last name cannot exceed 30 characters'],
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      enum: ['10th Pass', '12th Pass', 'Diploma', 'Degree', 'B.Tech'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      maxlength: [1024, 'Password is too long'],
      select: false,
    },
    role: {
      type: String,
      enum: [
        'user',
        'admin',
        'exam_admin',
        'question_admin',
        'hallticket_admin',
        'grader_admin',
        'superadmin',
        'company',
      ],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'company'],
      default: 'free',
    },
    planExpiresAt: { type: Date, default: null },
    planLimits: {
      labSessions: { type: Number, default: 2 },
      codeRunsPerDay: { type: Number, default: 50 },
      projectSubmissions: { type: Number, default: 5 },
      advancedAnalytics: { type: Boolean, default: false },
    },
    companyProfile: {
      companyName: String,
      website: String,
      industry: String,
      size: String,
      description: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    learningPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    badges: {
      type: [String],
      default: [],
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PLAN_LIMITS = {
  free: { labSessions: 2, codeRunsPerDay: 50, projectSubmissions: 5, advancedAnalytics: false },
  pro: { labSessions: 10, codeRunsPerDay: 500, projectSubmissions: 50, advancedAnalytics: true },
  company: { labSessions: 0, codeRunsPerDay: 0, projectSubmissions: 0, advancedAnalytics: true },
};

userSchema.methods.resolveLimits = function () {
  if (this.plan && PLAN_LIMITS[this.plan]) {
    this.planLimits = PLAN_LIMITS[this.plan];
  }
  return this.planLimits;
};

userSchema.methods.hasPlan = function (plan) {
  if (this.planExpiresAt && this.planExpiresAt < new Date()) {
    this.plan = 'free';
    this.planExpiresAt = null;
    this.resolveLimits();
    return plan === 'free';
  }
  if (Array.isArray(plan)) return plan.includes(this.plan);
  return this.plan === plan;
};

// Hash password before saving
userSchema.pre('save', async function () {
  if (this.isModified('role') || this.isModified('plan') || !this.planLimits) {
    this.resolveLimits();
  }
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
