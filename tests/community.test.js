const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Community = require('../models/Community');
const Discussion = require('../models/Discussion');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(300000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_community';

let users;
let tokens;

const createUser = (firstname, phone, email) =>
  User.create({
    fullname: { firstname, lastname: 'UniSphere' },
    email: email || `${firstname.toLowerCase()}@unisphere.com`,
    phone,
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Test@1234',
    role: 'user',
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all([User, Community, Discussion].map((model) => model.init()));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Community.deleteMany({}), Discussion.deleteMany({})]);
  const [alice, bob] = await Promise.all([
    createUser('Alice', '9210000001', 'alice@community.com'),
    createUser('Bob', '9210000002', 'bob@community.com'),
  ]);
  users = { alice, bob };
  tokens = { alice: generateToken(alice), bob: generateToken(bob) };
});

describe('Community', () => {
describe('communities', () => {
    it('lists communities publicly', async () => {
      await Community.create({ name: 'React Devs', slug: 'react-devs', description: 'React group', members: 10 });
      const res = await request(app).get('/api/v1/community/communities');
      expect(res.status).toBe(200);
      expect(res.body.data.communities[0].name).toBe('React Devs');
      expect(res.body.data.communities[0].members).toBe(10);
    });

    it('requires auth to create a community and generates a unique slug', async () => {
      const unauth = await request(app)
        .post('/api/v1/community/communities')
        .send({ name: 'React Devs' });
      expect(unauth.status).toBe(401);

      const res = await request(app)
        .post('/api/v1/community/communities')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ name: 'React Devs!!!' });
      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('react-devs');

      const dup = await request(app)
        .post('/api/v1/community/communities')
        .set('Authorization', `Bearer ${tokens.bob}`)
        .send({ name: 'React Devs' });
      expect(dup.status).toBe(201);
      expect(dup.body.data.slug).toBe('react-devs-2');
    });
  });
describe('discussions', () => {
    it('creates and lists discussions publicly with authors', async () => {
      const created = await request(app)
        .post('/api/v1/community/discussions')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ title: 'How does async work?', category: 'General', body: 'Explain like I am five.' });
      expect(created.status).toBe(201);
      expect(created.body.data.slug).toBe('how-does-async-work');
      expect(created.body.data.authorId.fullname.firstname).toBe('Alice');

      const res = await request(app).get('/api/v1/community/discussions');
      expect(res.status).toBe(200);
      expect(res.body.data.discussions.length).toBe(1);
      expect(res.body.data.discussions[0].title).toBe('How does async work?');
    });

    it('filters discussions by category', async () => {
      await Discussion.create({
        title: 'JS promos',
        slug: 'js-promos',
        category: 'General',
        body: 'x',
        authorId: users.alice._id,
      });
      await Discussion.create({
        title: 'Docker tips',
        slug: 'docker-tips',
        category: 'DevOps',
        body: 'y',
        authorId: users.bob._id,
      });

      const res = await request(app).get('/api/v1/community/discussions?category=DevOps');
      expect(res.body.data.discussions.length).toBe(1);
      expect(res.body.data.discussions[0].title).toBe('Docker tips');
    });

    it('adds answers that count toward the replies badge', async () => {
      const created = await request(app)
        .post('/api/v1/community/discussions')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ title: 'Docker Compose?', category: 'DevOps', body: 'Help' });
      const id = created.body.data._id;

      const answer = await request(app)
        .post(`/api/v1/community/discussions/${id}/answers`)
        .set('Authorization', `Bearer ${tokens.bob}`)
        .send({ content: 'Use compose up -d' });
      expect(answer.status).toBe(201);
      expect(answer.body.data.answers.length).toBe(1);
      expect(answer.body.data.answers[0].content).toBe('Use compose up -d');

      const list = await request(app).get('/api/v1/community/discussions');
      expect(list.body.data.discussions[0].answers.length).toBe(1);

      const detail = await request(app).get(`/api/v1/community/discussions/${id}`);
      expect(detail.body.data.answers[0].authorId.fullname.firstname).toBe('Bob');
    });

    it('requires auth to create discussions and answers', async () => {
      const noAuth = await request(app)
        .post('/api/v1/community/discussions')
        .send({ title: 'T', category: 'C', body: 'B' });
      expect(noAuth.status).toBe(401);

      const disc = await Discussion.create({
        title: 'Test',
        slug: 'test',
        category: 'General',
        body: 'body',
        authorId: users.alice._id,
      });
      const noAuthAnswer = await request(app)
        .post(`/api/v1/community/discussions/${disc._id}/answers`)
        .send({ content: 'a' });
      expect(noAuthAnswer.status).toBe(401);
    });

    it('returns 404 for unknown discussion', async () => {
      const fake = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/community/discussions/${fake}`);
      expect(res.status).toBe(404);
    });
describe('detail endpoints (id or slug)', () => {
    it('fetches a community by slug', async () => {
      await Community.create({ name: 'Node Guild', slug: 'node-guild', description: 'Node folks' });
      const res = await request(app).get('/api/v1/community/communities/node-guild');
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Node Guild');
    });

    it('fetches a discussion by slug or by id', async () => {
      const d = await Discussion.create({
        title: 'Best practices for Express',
        slug: 'best-practices-for-express',
        category: 'Backend',
        body: 'Share tips',
        authorId: users.alice._id,
      });

      const bySlug = await request(app).get('/api/v1/community/discussions/best-practices-for-express');
      expect(bySlug.status).toBe(200);
      expect(bySlug.body.data.title).toBe('Best practices for Express');

      const byId = await request(app).get(`/api/v1/community/discussions/${d._id}`);
      expect(byId.status).toBe(200);
      expect(byId.body.data.slug).toBe('best-practices-for-express');
    });

    it('answers are still addable when the discussion is reached by slug', async () => {
      const d = await Discussion.create({
        title: 'Docker networking',
        slug: 'docker-networking',
        category: 'DevOps',
        body: 'bridge vs host',
        authorId: users.alice._id,
      });
      const res = await request(app)
        .post('/api/v1/community/discussions/docker-networking/answers')
        .set('Authorization', `Bearer ${tokens.bob}`)
        .send({ content: 'Use bridge for isolation' });
      expect(res.status).toBe(201);
      expect(res.body.data.answers.length).toBe(1);
      const fresh = await Discussion.findById(d._id);
      expect(fresh.answers.length).toBe(1);
    });
  });
  });
});