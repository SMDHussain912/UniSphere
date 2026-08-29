const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectSubmission = require('../models/ProjectSubmission');
const dockerRunner = require('../utils/dockerRunner');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(90000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/unitech_test_projects';

let token;
let userId;
let projectId;
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
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL);
  await Promise.all(
    [User, Project, ProjectSubmission].map((model) => model.init())
  );
  dockerAvailable = await dockerRunner.isDockerAvailable();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    ProjectSubmission.deleteMany({}),
  ]);

  const user = await createUser('Builder', '9000000001');
  userId = user._id;
  token = generateToken(user._id);

  const project = await Project.create({
    title: 'Hello World Console App',
    slug: 'hello-world-console',
    description: 'Build a simple console app that prints Hello World',
    difficulty: 'beginner',
    skillKeys: ['javascript', 'nodejs'],
    testCriteria: [
      { name: 'prints hello', command: 'node main.js', expectedOutput: 'Hello', points: 50 },
    ],
    totalPoints: 50,
  });
  projectId = project._id;
});

describe('Projects', () => {
  it('lists published projects publicly', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(200);
    expect(res.body.data.projects.length).toBe(1);
  });

  it('returns project detail by slug', async () => {
    const res = await request(app).get('/api/v1/projects/hello-world-console');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Hello World Console App');
  });

  it('filters projects by difficulty', async () => {
    const res = await request(app).get('/api/v1/projects?difficulty=beginner');
    expect(res.status).toBe(200);
    expect(res.body.data.projects.length).toBe(1);
  });

  it('creates a project', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Project',
        slug: 'new-project',
        description: 'A new project',
        difficulty: 'intermediate',
        skillKeys: ['python'],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('new-project');
  });

  it('updates a project', async () => {
    const res = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });
describe('Project Submissions', () => {
  it('submits a project', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'console.log("Hello World")' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('submitted');
  });

  it('lists my submissions', async () => {
    await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'console.log("Hello")' });

    const res = await request(app)
      .get('/api/v1/projects/submissions/mine')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('gets submission detail', async () => {
    const created = await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'console.log("Hello")' });
    const id = created.body.data._id;

    const res = await request(app)
      .get(`/api/v1/projects/submissions/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('runs automated tests on submission', async () => {
    if (!dockerAvailable) {
      console.log('Skipping: Docker not available');
      return;
    }
    const created = await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'console.log("Hello World")' });
    const id = created.body.data._id;

    const res = await request(app)
      .post(`/api/v1/projects/submissions/${id}/test`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('passed');
    expect(res.body.data).toHaveProperty('score');
  });

  it('requires auth for submission', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .send({ code: 'console.log("hi")' });
    expect(res.status).toBe(401);
  });
});

describe('Peer Review', () => {
  it('adds a review to a submission', async () => {
    const reviewer = await createUser('Reviewer', '9000000002');
    const reviewerToken = generateToken(reviewer._id);

    const created = await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'console.log("Hello")' });
    const id = created.body.data._id;

    const res = await request(app)
      .post(`/api/v1/projects/submissions/${id}/review`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({ rating: 5, feedback: 'Excellent work!' });
    expect(res.status).toBe(200);
    expect(res.body.data.reviews.length).toBe(1);
    expect(res.body.data.reviews[0].rating).toBe(5);
  });

  it('prevents self-review', async () => {
    const created = await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'console.log("Hello")' });
    const id = created.body.data._id;

    const res = await request(app)
      .post(`/api/v1/projects/submissions/${id}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5 });
    expect(res.status).toBe(400);
  });

  it('validates review rating', async () => {
    const reviewer = await createUser('Reviewer2', '9000000003');
    const reviewerToken = generateToken(reviewer._id);

    const created = await request(app)
      .post(`/api/v1/projects/${projectId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'console.log("Hello")' });
    const id = created.body.data._id;

    const res = await request(app)
      .post(`/api/v1/projects/submissions/${id}/review`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({ rating: 6 });
    expect(res.status).toBe(400);
  });
});

  it('deletes a project', async () => {
    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const project = await Project.findById(projectId);
    expect(project).toBeNull();
  });

  it('validates project fields', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '', slug: '', description: '' });
    expect(res.status).toBe(400);
  });

  it('requires auth to create project', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .send({ title: 'No Auth', slug: 'no-auth', description: 'test' });
    expect(res.status).toBe(401);
  });
});