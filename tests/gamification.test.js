const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { UserLevel } = require('../models/UserLevel');
const { Achievement } = require('../models/Achievement');
const Project = require('../models/Project');
const ProjectSubmission = require('../models/ProjectSubmission');
const Profile = require('../models/Profile');
const UserSkill = require('../models/UserSkill');
const { generateToken } = require('../utils/generateToken');
const { awardXp, awardXpBySkill } = require('../controllers/gamificationController');

jest.setTimeout(300000);

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_gamif';

let token;
let userToken;
let userId;
let adminId;

const createUser = (firstname, phone, role = 'user') =>
  User.create({
    fullname: { firstname, lastname: 'UniSphere' },
    email: `${firstname.toLowerCase()}@unisphere.com`,
    phone,
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Test@1234',
    role,
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all([User, UserLevel, Achievement, Project, ProjectSubmission, Profile, UserSkill].map((m) => m.init()));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    UserLevel.deleteMany({}),
    Achievement.deleteMany({}),
    ProjectSubmission.deleteMany({}),
    Project.deleteMany({}),
    UserSkill.deleteMany({}),
  ]);
  const user = await createUser('Gamer', '9000000010');
  userId = user._id;
  userToken = generateToken(user._id);

  const admin = await createUser('Admin', '9000000011', 'admin');
  adminId = admin._id;
  token = generateToken(admin._id);
});

describe('Gamification', () => {
  it('awards XP and computes level', async () => {
    await awardXp(userId, 250, 'test');
    const res = await request(app)
      .get('/api/v1/my/level')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.xp).toBe(250);
    expect(res.body.data.level).toBe(1);
    expect(res.body.data.levelName).toBe('Apprentice');
    expect(res.body.data.nextLevelXp).toBe(350);
  });

  it('computes level thresholds', async () => {
    await awardXp(userId, 1600, 'test');
    const level = await UserLevel.findOne({ userId });
    const computed = UserLevel.computeLevel(level.xp);
    expect(computed.level).toBe(3);
    expect(computed.levelName).toBe('Engineer');
  });

  it('awards XP per skill', async () => {
    await awardXpBySkill(userId, 'python', 100);
    await awardXpBySkill(userId, 'python', 50);
    const level = await UserLevel.findOne({ userId });
    expect(level.perSkillXp.get('python')).toBe(150);
  });

  it('returns leaderboard', async () => {
    await User.findByIdAndUpdate(userId, { learningPoints: 500 });
    const res = await request(app).get('/api/v1/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].learningPoints).toBe(500);
  });

  it('returns per-skill leaderboard', async () => {
    await awardXpBySkill(userId, 'python', 100);
    const res = await request(app).get('/api/v1/leaderboard/skill/python');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].xp).toBe(100);
  });

  it('returns portfolio view', async () => {
    await awardXp(userId, 300, 'test');
    await Profile.create({ userId, headline: 'Developer' });
    await UserSkill.create({ userId, skillKey: 'python', level: 80, verified: true });
    const res = await request(app)
      .get('/api/v1/portfolio')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.fullname.firstname).toBe('Gamer');
    expect(res.body.data.stats.totalXp).toBe(300);
    expect(res.body.data.stats.verifiedSkills.length).toBe(1);
  });

  it('requires auth for my level', async () => {
    const res = await request(app).get('/api/v1/my/level');
    expect(res.status).toBe(401);
  });

  it('requires auth for my achievements', async () => {
    const res = await request(app).get('/api/v1/my/achievements');
    expect(res.status).toBe(401);
  });
});
