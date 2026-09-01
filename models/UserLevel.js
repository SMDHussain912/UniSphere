const mongoose = require('mongoose');

const LEVEL_THRESHOLDS = [
  { level: 0, name: 'Novice', xpRequired: 0 },
  { level: 1, name: 'Apprentice', xpRequired: 200 },
  { level: 2, name: 'Developer', xpRequired: 600 },
  { level: 3, name: 'Engineer', xpRequired: 1500 },
  { level: 4, name: 'Expert', xpRequired: 3000 },
  { level: 5, name: 'Master', xpRequired: 6000 },
];

const userLevelSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 0, min: 0 },
    levelName: { type: String, default: 'Novice' },
    perSkillXp: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

userLevelSchema.statics.LEVEL_THRESHOLDS = LEVEL_THRESHOLDS;

userLevelSchema.statics.computeLevel = function (xp) {
  let level = 0;
  let levelName = LEVEL_THRESHOLDS[0].name;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (xp >= LEVEL_THRESHOLDS[i].xpRequired) {
      level = LEVEL_THRESHOLDS[i].level;
      levelName = LEVEL_THRESHOLDS[i].name;
      break;
    }
  }
  return { level, levelName };
};

userLevelSchema.statics.xpToNextLevel = function (xp) {
  const { level } = this.computeLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length - 1) return 0;
  return LEVEL_THRESHOLDS[level + 1].xpRequired - xp;
};

module.exports = {
  UserLevel: mongoose.model('UserLevel', userLevelSchema),
  LEVEL_THRESHOLDS: LEVEL_THRESHOLDS,
};