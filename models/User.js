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
      ],
      default: 'user',
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

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
