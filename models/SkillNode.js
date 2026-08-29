const mongoose = require('mongoose');

const skillNodeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Skill key is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    parentKey: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    order: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

skillNodeSchema.index({ parentKey: 1 });
skillNodeSchema.index({ category: 1 });

module.exports = mongoose.model('SkillNode', skillNodeSchema);