const mongoose = require('mongoose');

const ACHIEVEMENTS = [
  { key: 'first_course', name: 'First Course Completed', description: 'Completed your first course on UniSphere', icon: 'book', tier: 'bronze' },
  { key: 'first_project', name: 'First Project Built', description: 'Submitted your first project', icon: 'project', tier: 'bronze' },
  { key: 'first_challenge', name: 'First Challenge Solved', description: 'Solved your first coding challenge', icon: 'trophy', tier: 'bronze' },
  { key: 'quiz_master', name: 'Quiz Master', description: 'Passed a quiz with 90% or higher', icon: 'quiz', tier: 'bronze' },
  { key: 'first_assessment', name: 'Assessment Taken', description: 'Completed your first formal assessment', icon: 'trophy', tier: 'bronze' },
  { key: 'level_2', name: 'Apprentice', description: 'Reached Apprentice level (Level 2)', icon: 'level-up', tier: 'bronze' },
  { key: 'skill_5', name: 'Skillful', description: 'Reached level 5 in 5 different skills', icon: 'skills', tier: 'silver' },
  { key: 'project_5', name: 'Builder', description: 'Completed 5 projects', icon: 'projects', tier: 'silver' },
  { key: 'level_3', name: 'Rising Developer', description: 'Reached Developer level (Level 3)', icon: 'level-up', tier: 'silver' },
  { key: 'streak_7', name: 'Week Streak', description: 'Practiced for 7 consecutive days', icon: 'streak', tier: 'silver' },
  { key: 'level_5', name: 'Expert', description: 'Reached Expert level (Level 5)', icon: 'expert', tier: 'gold' },
  { key: 'skill_10', name: 'Polyglot', description: 'Verified 10 skills', icon: 'star', tier: 'gold' },
  { key: 'project_20', name: 'Master Builder', description: 'Completed 20 projects', icon: 'master', tier: 'gold' },
  { key: 'perfect_score', name: 'Perfect Score', description: 'Scored 100% on a challenge', icon: 'perfect', tier: 'gold' },
];

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    key: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, default: 'trophy' },
    tier: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
    earnedAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

achievementSchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = {
  Achievement: mongoose.model('Achievement', achievementSchema),
  ACHIEVEMENTS,
};