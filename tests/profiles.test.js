const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Follow = require('../models/Follow');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(120000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_profiles';

let tokens;
let users;

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
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all([User, Profile, Follow].map((model) => model.init()));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Profile.deleteMany({}), Follow.deleteMany({})]);

  const [alice, bob, charlie] = await Promise.all([
    createUser('Alice', '9000000001'),
    createUser('Bob', '9000000002'),
    createUser('Charlie', '9000000003'),
  ]);

  users = { alice, bob, charlie };
  tokens = {
    alice: generateToken(alice._id),
    bob: generateToken(bob._id),
    charlie: generateToken(charlie._id),
  };
});

describe('Profile and follow system', () => {
  it('creates and updates a user profile', async () => {
    const emptyRes = await request(app)
      .get('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(emptyRes.status).toBe(200);
    expect(emptyRes.body.data).toBeNull();

    const updateRes = await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.alice}`)
      .send({
        headline: 'Full Stack Developer',
        bio: 'Passionate about building scalable apps',
        location: 'Hyderabad',
        skills: ['React', 'Node.js', 'MongoDB'],
        availableForWork: true,
        visibility: 'public',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.headline).toBe('Full Stack Developer');
    expect(updateRes.body.data.skills).toEqual(['React', 'Node.js', 'MongoDB']);
    expect(updateRes.body.data.availableForWork).toBe(true);
  });

  it('validates profile fields', async () => {
    const res = await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.alice}`)
      .send({ headline: 'x'.repeat(121) });
    expect(res.status).toBe(400);
  });

  it('shows public profile and hides private ones', async () => {
    await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.alice}`)
      .send({ headline: 'Public profile', visibility: 'public' });

    const publicRes = await request(app).get(`/api/v1/profiles/${users.alice._id}`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.profile).not.toBeNull();
    expect(publicRes.body.data.profile.headline).toBe('Public profile');

    await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.bob}`)
      .send({ headline: 'Private profile', visibility: 'private' });

    const privateRes = await request(app).get(`/api/v1/profiles/${users.bob._id}`);
    expect(privateRes.status).toBe(200);
    expect(privateRes.body.data.profile).toBeNull();
  });
  it('follows and unfollows users', async () => {
    const followRes = await request(app)
      .post(`/api/v1/follows/${users.bob._id}/follow`)
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(followRes.status).toBe(201);

    const duplicateRes = await request(app)
      .post(`/api/v1/follows/${users.bob._id}/follow`)
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(duplicateRes.status).toBe(400);

    const selfRes = await request(app)
      .post(`/api/v1/follows/${users.alice._id}/follow`)
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(selfRes.status).toBe(400);

    const followingRes = await request(app)
      .get('/api/v1/follows/me/following')
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(followingRes.status).toBe(200);
    expect(followingRes.body.data.length).toBe(1);
    expect(followingRes.body.data[0]._id).toBe(users.bob._id.toString());

    const followersRes = await request(app)
      .get(`/api/v1/follows/${users.bob._id}/followers`);
    expect(followersRes.status).toBe(200);
    expect(followersRes.body.data.length).toBe(1);

    const isFollowingRes = await request(app)
      .get(`/api/v1/follows/${users.bob._id}/is-following`)
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(isFollowingRes.status).toBe(200);
    expect(isFollowingRes.body.data.following).toBe(true);

    const unfollowRes = await request(app)
      .delete(`/api/v1/follows/${users.bob._id}/follow`)
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(unfollowRes.status).toBe(200);

    const afterUnfollowRes = await request(app)
      .get(`/api/v1/follows/${users.bob._id}/is-following`)
      .set('Authorization', `Bearer ${tokens.alice}`);
    expect(afterUnfollowRes.body.data.following).toBe(false);
  });

  it('lists directory with search and filters', async () => {
    await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.alice}`)
      .send({ headline: 'React Dev', skills: ['React'], availableForWork: true, visibility: 'public' });

    await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.bob}`)
      .send({ headline: 'Python Dev', skills: ['Python'], availableForWork: false, visibility: 'public' });

    const allRes = await request(app).get('/api/v1/directory');
    expect(allRes.status).toBe(200);
    expect(allRes.body.data.learners.length).toBe(2);

    const skillRes = await request(app).get('/api/v1/directory?skill=React');
    expect(skillRes.status).toBe(200);
    expect(skillRes.body.data.learners.length).toBe(1);
    expect(skillRes.body.data.learners[0].skills).toContain('React');

    const availableRes = await request(app).get('/api/v1/directory?available=true');
    expect(availableRes.status).toBe(200);
    expect(availableRes.body.data.learners.length).toBe(1);

    const searchRes = await request(app).get('/api/v1/directory?q=Alice');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.learners.length).toBe(1);
  });

  it('shows leaderboard and skill suggestions', async () => {
    await User.findByIdAndUpdate(users.alice._id, { points: 150 });
    await User.findByIdAndUpdate(users.bob._id, { points: 300 });

    const leaderRes = await request(app).get('/api/v1/directory/leaderboard');
    expect(leaderRes.status).toBe(200);
    expect(leaderRes.body.data.leaders[0].id).toBe(users.bob._id.toString());
    expect(leaderRes.body.data.leaders[0].rank).toBe(1);

    await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${tokens.alice}`)
      .send({ skills: ['React', 'Node.js'], visibility: 'public' });

    const skillsRes = await request(app).get('/api/v1/directory/skills');
    expect(skillsRes.status).toBe(200);
    expect(skillsRes.body.data).toEqual(expect.arrayContaining(['React', 'Node.js']));
  });
});