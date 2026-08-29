const mongoose = require('mongoose');

const jobRequirementSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    skillKey: {
      type: String,
      required: [true, 'Skill key is required'],
      trim: true,
      lowercase: true,
    },
    minimumLevel: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
    importance: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

jobRequirementSchema.index({ jobId: 1, skillKey: 1 }, { unique: true });

module.exports = mongoose.model('JobRequirement', jobRequirementSchema);