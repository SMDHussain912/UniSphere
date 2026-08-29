const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const SkillNode = require('../models/SkillNode');
const UserSkill = require('../models/UserSkill');
const skillGraph = require('../utils/skillGraph');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(90000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/unitech_test_skills';

let token;
let userId;

const createUser = (firstname, phone) =>
  User.create({
    fullname: { firstname, lastname: 'UniSphere' },
    email: `${firstname.toLowerCase()}@unisphere.com`,
    phone,
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Test@1234',
    role: 'user',
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL);
  await Promise.all([User, SkillNode, UserSkill].map((model) => model.init()));
  await skillGraph.seedGraph();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), SkillNode.deleteMany({}), UserSkill.deleteMany({})]);
  await skillGraph.seedGraph();

  const user = await createUser('Learner', '9000000001');
  userId = user._id;
  token = generateToken(user._id);
});

describe('Skill Graph', () => {
  it('seeds the graph from YAML', async () => {
    const count = await SkillNode.countDocuments();
    expect(count).toBeGreaterThan(20);
  });

  it('returns the full skill tree publicly', async () => {
    const res = await request(app).get('/api/v1/skills');
    expect(res.status).toBe(200);
    expect(res.body.data.tree.length).toBeGreaterThan(0);
    const python = res.body.data.tree.find((t) => t.key === 'python');
    expect(python).toBeTruthy();
    expect(python.children.length).toBeGreaterThan(0);
  });

  it('returns skill detail with parent and children', async () => {
    const res = await request(app).get('/api/v1/skills/python');
    expect(res.status).toBe(200);
    expect(res.body.data.skill.key).toBe('python');
    expect(res.body.data.children.length).toBeGreaterThan(0);
    expect(res.body.data.parent).toBeNull();
  });

  it('returns 404 for unknown skill', async () => {
    const res = await request(app).get('/api/v1/skills/nonexistent-skill');
    expect(res.status).toBe(404);
  });

  it('requires auth for recommendations', async () => {
    const res = await request(app).get('/api/v1/skills/recommendations');
    expect(res.status).toBe(401);
  });
describe('User Skills and Evidence', () => {
  it('starts with no skills', async () => {
    const res = await request(app)
      .get('/api/v1/my/skills')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.skills.length).toBe(0);
  });

  it('adds evidence and computes level', async () => {
    const res = await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'course_completed', title: 'Python Basics Course' });
    expect(res.status).toBe(201);
    expect(res.body.data.skill.level).toBe(25);
    expect(res.body.data.pointsAwarded).toBe(25);
    expect(res.body.data.skill.evidence.length).toBe(1);
  });

  it('adds multiple evidence and accumulates level', async () => {
    await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'course_completed', title: 'Python Course' });

    await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'project', title: 'Built a CLI tool' });

    const res = await request(app)
      .get('/api/v1/my/skills/python')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.progress.level).toBe(45);
    expect(res.body.data.progress.evidence.length).toBe(2);
  });

  it('verifies skill when evidence is sufficient', async () => {
    await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'course_completed', title: 'Course' });

    await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'project', title: 'Project' });

    const res = await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'assessment', title: 'Python Test', score: 86 });

    expect(res.status).toBe(201);
    expect(res.body.data.skill.verified).toBe(true);
    expect(res.body.data.skill.verifiedAt).toBeTruthy();
  });

  it('does not verify with only one evidence type', async () => {
    await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'exercise', title: 'Exercise 1' });

    await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'exercise', title: 'Exercise 2' });

    const res = await request(app)
      .get('/api/v1/my/skills/python')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.progress.verified).toBe(false);
  });

  it('removes evidence and recomputes level', async () => {
    const first = await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'course_completed', title: 'Course' });
    const evidenceId = first.body.data.skill.evidence[0]._id;

    const removeRes = await request(app)
      .delete(`/api/v1/my/skills/python/evidence/${evidenceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data.skill.level).toBe(0);
    expect(removeRes.body.data.skill.evidence.length).toBe(0);
  });

  it('rejects invalid evidence type', async () => {
    const res = await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'invalid_type', title: 'Bad' });
    expect(res.status).toBe(400);
  });

  it('requires authentication for all user skill routes', async () => {
    const list = await request(app).get('/api/v1/my/skills');
    expect(list.status).toBe(401);

    const add = await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .send({ type: 'exercise', title: 'Hack' });
    expect(add.status).toBe(401);
  });

  it('updates user learning points in the database', async () => {
    await request(app)
      .post('/api/v1/my/skills/python/evidence')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'course_completed', title: 'Python Course' });

    const user = await User.findById(userId).select('learningPoints');
    expect(user.learningPoints).toBe(25);
  });
});

  it('recommends next skills based on prerequisites', async () => {
    await UserSkill.create({
      userId,
      skillKey: 'python',
      evidence: [{ type: 'course_completed', title: 'Python Course', count: 1 }],
      level: 25,
    });

    const res = await request(app)
      .get('/api/v1/skills/recommendations')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const keys = res.body.data.recommendations.map((r) => r.skill.key);
    expect(keys).toContain('python-basics');
    expect(keys).not.toContain('python');
  });
});