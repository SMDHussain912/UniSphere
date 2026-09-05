const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Snippet = require('../models/Snippet');
const LabSession = require('../models/LabSession');
const dockerRunner = require('../utils/dockerRunner');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(300000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_lab';

let token;
let userId;
let dockerAvailable = false;

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
    plan: 'pro',
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all(
    [User, Snippet, LabSession].map((model) => model.init())
  );
  dockerAvailable = await dockerRunner.isDockerAvailable();
}, 600000);

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Snippet.deleteMany({}),
    LabSession.deleteMany({}),
  ]);

  const user = await createUser('Coder', '9000000001');
  userId = user._id;
  token = generateToken(user._id);
});

describe('Code Lab — Snippets', () => {
  it('saves a snippet', async () => {
    const res = await request(app)
      .post('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hello World', language: 'javascript', code: 'console.log("hi")' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Hello World');
    expect(res.body.data.language).toBe('javascript');
  });

  it('lists user snippets', async () => {
    await request(app)
      .post('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Snippet 1', language: 'python', code: 'print("hello")' });

    const res = await request(app)
      .get('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('updates a snippet', async () => {
    const created = await request(app)
      .post('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Old Title', language: 'javascript', code: '' });
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/v1/code/snippets/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New Title');
  });

  it('deletes a snippet', async () => {
    const created = await request(app)
      .post('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Delete Me', language: 'javascript', code: '' });
    const id = created.body.data._id;

    const res = await request(app)
      .delete(`/api/v1/code/snippets/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const snippet = await Snippet.findById(id);
    expect(snippet).toBeNull();
  });

describe('Code Lab — Run Code', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/v1/code/run')
      .send({ language: 'javascript', code: 'console.log("hi")' });
    expect(res.status).toBe(401);
  });

  it('validates language', async () => {
    const res = await request(app)
      .post('/api/v1/code/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'brainfuck', code: '+' });
    expect(res.status).toBe(400);
  });

  it('validates code is present', async () => {
    const res = await request(app)
      .post('/api/v1/code/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript' });
    expect(res.status).toBe(400);
  });

  it('runs JavaScript code in Docker', async () => {
    if (!dockerAvailable) {
      console.log('Skipping: Docker not available');
      return;
    }
    const res = await request(app)
      .post('/api/v1/code/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript', code: 'console.log("hello from docker")' });
    expect(res.status).toBe(200);
    expect(res.body.data.output).toContain('hello from docker');
  });

  it('runs Python code in Docker', async () => {
    if (!dockerAvailable) {
      console.log('Skipping: Docker not available');
      return;
    }
    const res = await request(app)
      .post('/api/v1/code/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', code: 'print("hello from python")' });
    expect(res.status).toBe(200);
    expect(res.body.data.output).toContain('hello from python');
  });
});

describe('Lab Sessions', () => {
  it('requires auth for session operations', async () => {
    const res = await request(app).get('/api/v1/lab');
    expect(res.status).toBe(401);
  });

  it('starts with no sessions', async () => {
    const res = await request(app)
      .get('/api/v1/lab')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('validates session type', async () => {
    if (!dockerAvailable) {
      console.log('Skipping: Docker not available');
      return;
    }
    const res = await request(app)
      .post('/api/v1/lab')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionType: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('creates a lab session in Docker', async () => {
    if (!dockerAvailable) {
      console.log('Skipping: Docker not available');
      return;
    }
    const res = await request(app)
      .post('/api/v1/lab')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionType: 'code-server' });
    expect(res.status).toBe(201);
    expect(res.body.data.session.status).toBe('active');
    expect(res.body.data.session.port).toBeGreaterThan(0);
    expect(res.body.data.timeRemainingMinutes).toBeGreaterThan(0);
  });

  it('stops a lab session', async () => {
    if (!dockerAvailable) {
      console.log('Skipping: Docker not available');
      return;
    }
    const created = await request(app)
      .post('/api/v1/lab')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionType: 'code-server' });
    const id = created.body.data.session._id;

    const res = await request(app)
      .post(`/api/v1/lab/${id}/stop`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('stopped');
  });

  it('prevents multiple active sessions per user', async () => {
    if (!dockerAvailable) {
      console.log('Skipping: Docker not available');
      return;
    }
    await request(app)
      .post('/api/v1/lab')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionType: 'code-server' });

    const res = await request(app)
      .post('/api/v1/lab')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionType: 'code-server' });
    expect(res.status).toBe(400);
  });
});
  it('shows public snippets to all users', async () => {
    await request(app)
      .post('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Public Snippet', language: 'python', code: 'x = 1', isPublic: true });

    const other = await createUser('Other', '9000000002');
    const otherToken = generateToken(other._id);

    const res = await request(app)
      .get('/api/v1/code/snippets/public')
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('hides private snippets from other users', async () => {
    const created = await request(app)
      .post('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Private', language: 'javascript', code: '', isPublic: false });
    const id = created.body.data._id;

    const other = await createUser('Other2', '9000000003');
    const otherToken = generateToken(other._id);

    const res = await request(app)
      .get(`/api/v1/code/snippets/${id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('requires auth for snippet operations', async () => {
    const res = await request(app).get('/api/v1/code/snippets');
    expect(res.status).toBe(401);
  });

  it('validates snippet fields', async () => {
    const res = await request(app)
      .post('/api/v1/code/snippets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '', language: '' });
    expect(res.status).toBe(400);
  });
});