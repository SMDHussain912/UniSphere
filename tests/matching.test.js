const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Job = require('../models/Jobs');
const JobRequirement = require('../models/JobRequirement');
const UserSkill = require('../models/UserSkill');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(300000);

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_matching';

let token;
let adminToken;
let jobId;

const createUser = (firstname, phone, role = 'user') =>
  User.create({
    fullname: { firstname, lastname: 'UniSphere' },
    email: `${firstname.toLowerCase()}.${role}@unisphere.com`,
    phone,
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Test@1234',
    role,
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all([User, Job, JobRequirement, UserSkill].map((model) => model.init()));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Job.deleteMany({}), JobRequirement.deleteMany({}), UserSkill.deleteMany({})]);
  const user = await createUser('Seeker', '9000000001');
  const admin = await createUser('Admin', '9000000002', 'admin');
  token = generateToken(user._id);
  adminToken = generateToken(admin._id);
  const job = await Job.create({
    id: 1, title: 'Python Developer', organization: 'UniSphere', category: 'Technology', status: 'Active',
    description: 'Build web applications', qualification: 'Degree', experienceRequired: '0-2 years',
    salary: '6-10 LPA', vacancies: 3, employmentType: 'Full Time', skills: ['python', 'django', 'sql'],
    lastDate: new Date('2030-12-31'), location: 'Hyderabad',
  });
  jobId = job._id;
  await JobRequirement.create([
    { jobId, skillKey: 'python', minimumLevel: 70, importance: 3 },
    { jobId, skillKey: 'django', minimumLevel: 60, importance: 2 },
    { jobId, skillKey: 'sql', minimumLevel: 50, importance: 2 },
  ]);
});

describe('Job Matching', () => {
  it('calculates match percentage for a job', async () => {
    const user = await User.findOne({ email: 'seeker.user@unisphere.com' });
    await UserSkill.create({ userId: user._id, skillKey: 'python', level: 80, evidence: [] });
    const res = await request(app).get(`/api/v1/match/jobs/${jobId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('matchPercentage');
    expect(res.body.data.matchPercentage).toBeGreaterThanOrEqual(0);
    expect(res.body.data.matchPercentage).toBeLessThanOrEqual(100);
  });

  it('identifies skill gaps', async () => {
    const user = await User.findOne({ email: 'seeker.user@unisphere.com' });
    await UserSkill.create({ userId: user._id, skillKey: 'python', level: 80, evidence: [] });
    const res = await request(app).get(`/api/v1/match/jobs/${jobId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.gaps.length).toBeGreaterThan(0);
    const gapKeys = res.body.data.gaps.map((g) => g.skillKey);
    expect(gapKeys).toContain('django');
    expect(gapKeys).toContain('sql');
  });

  it('returns 100% match when all requirements met', async () => {
    const user = await User.findOne({ email: 'seeker.user@unisphere.com' });
    await UserSkill.create([
      { userId: user._id, skillKey: 'python', level: 80, evidence: [] },
      { userId: user._id, skillKey: 'django', level: 70, evidence: [] },
      { userId: user._id, skillKey: 'sql', level: 60, evidence: [] },
    ]);
    const res = await request(app).get(`/api/v1/match/jobs/${jobId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.matchPercentage).toBe(100);
    expect(res.body.data.gaps.length).toBe(0);
  });

  it('requires auth to get match', async () => {
    const res = await request(app).get(`/api/v1/match/jobs/${jobId}`);
    expect(res.status).toBe(401);
  });

  it('lists all job matches sorted by percentage', async () => {
    const res = await request(app).get('/api/v1/match/jobs').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.matches.length).toBe(1);
    expect(res.body.data.matches[0]).toHaveProperty('matchPercentage');
    expect(res.body.data.matches[0]).toHaveProperty('gapCount');
  });
});

describe('Job Requirements', () => {
  it('adds a requirement to a job', async () => {
    const res = await request(app).post(`/api/v1/match/jobs/${jobId}/requirements`).set('Authorization', `Bearer ${adminToken}`).send({ skillKey: 'docker', minimumLevel: 40, importance: 1 });
    expect(res.status).toBe(201);
    expect(res.body.data.skillKey).toBe('docker');
  });

  it('updates existing requirement', async () => {
    await request(app).post(`/api/v1/match/jobs/${jobId}/requirements`).set('Authorization', `Bearer ${adminToken}`).send({ skillKey: 'python', minimumLevel: 90, importance: 3 });
    const res = await request(app).post(`/api/v1/match/jobs/${jobId}/requirements`).set('Authorization', `Bearer ${adminToken}`).send({ skillKey: 'python', minimumLevel: 50, importance: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.minimumLevel).toBe(50);
  });

  it('removes a requirement', async () => {
    const res = await request(app).delete(`/api/v1/match/jobs/${jobId}/requirements/python`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('validates requirement fields', async () => {
    const res = await request(app).post(`/api/v1/match/jobs/${jobId}/requirements`).set('Authorization', `Bearer ${adminToken}`).send({ skillKey: '' });
    expect(res.status).toBe(400);
  });

  it('requires admin for requirement management', async () => {
    const res = await request(app).post(`/api/v1/match/jobs/${jobId}/requirements`).set('Authorization', `Bearer ${token}`).send({ skillKey: 'docker' });
    expect(res.status).toBe(403);
  });
});

describe('Candidate Ranking', () => {
  it('ranks candidates by match score', async () => {
    const user = await User.findOne({ email: 'seeker.user@unisphere.com' });
    await UserSkill.create([
      { userId: user._id, skillKey: 'python', level: 90, evidence: [] },
      { userId: user._id, skillKey: 'django', level: 80, evidence: [] },
      { userId: user._id, skillKey: 'sql', level: 70, evidence: [] },
    ]);
    const res = await request(app).get(`/api/v1/match/jobs/${jobId}/candidates`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.candidates.length).toBeGreaterThan(0);
    expect(res.body.data.candidates[0].matchPercentage).toBe(100);
  });

  it('requires admin to view candidates', async () => {
    const res = await request(app).get(`/api/v1/match/jobs/${jobId}/candidates`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns empty when no requirements set', async () => {
    await JobRequirement.deleteMany({ jobId });
    const res = await request(app).get(`/api/v1/match/jobs/${jobId}/candidates`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.candidates.length).toBe(0);
  });
});
