const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(120000);

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_subscription';

let freeUser, proUser, companyUser, adminUser;
let freeToken, proToken, companyToken, adminToken;

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all([User].map((m) => m.init()));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  freeUser = await User.create({ fullname: { firstname: 'Free', lastname: 'User' }, email: 'free@test.com', phone: '9000000001', dob: '1990-01-01', gender: 'Other', qualification: 'Degree', password: 'Test@1234', role: 'user' });
  proUser = await User.create({ fullname: { firstname: 'Pro', lastname: 'User' }, email: 'pro@test.com', phone: '9000000002', dob: '1990-01-01', gender: 'Other', qualification: 'Degree', password: 'Test@1234', role: 'user', plan: 'pro' });
  companyUser = await User.create({ fullname: { firstname: 'Company', lastname: 'User' }, email: 'company@test.com', phone: '9000000003', dob: '1990-01-01', gender: 'Other', qualification: 'Degree', password: 'Test@1234', role: 'company', plan: 'company', companyProfile: { companyName: 'TestCorp' } });
  adminUser = await User.create({ fullname: { firstname: 'Admin', lastname: 'User' }, email: 'admin@test.com', phone: '9000000004', dob: '1990-01-01', gender: 'Other', qualification: 'Degree', password: 'Test@1234', role: 'superadmin' });
  freeToken = generateToken(freeUser);
  proToken = generateToken(proUser);
  companyToken = generateToken(companyUser);
  adminToken = generateToken(adminUser);
});

describe('Phase 10 - Subscription & Plan Gating', () => {
  describe('GET /api/v1/subscriptions/plans', () => {
    it('returns all available plans', async () => {
      const res = await request(app).get('/api/v1/subscriptions/plans');
      expect(res.status).toBe(200);
      expect(res.body.data.free).toBeDefined();
      expect(res.body.data.pro).toBeDefined();
      expect(res.body.data.company).toBeDefined();
      expect(res.body.data.pro.price).toBe(15);
    });
  });

  describe('GET /api/v1/subscriptions/me', () => {
    it('returns free user subscription with default limits', async () => {
      const res = await request(app).get('/api/v1/subscriptions/me').set('Authorization', `Bearer ${freeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('free');
      expect(res.body.data.limits.labSessions).toBe(2);
      expect(res.body.data.limits.codeRunsPerDay).toBe(50);
      expect(res.body.data.features).toBeInstanceOf(Array);
    });

    it('returns pro user with elevated limits', async () => {
      const res = await request(app).get('/api/v1/subscriptions/me').set('Authorization', `Bearer ${proToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('pro');
      expect(res.body.data.limits.labSessions).toBe(10);
      expect(res.body.data.limits.advancedAnalytics).toBe(true);
    });

    it('returns company user subscription', async () => {
      const res = await request(app).get('/api/v1/subscriptions/me').set('Authorization', `Bearer ${companyToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('company');
    });
  });

  describe('POST /api/v1/subscriptions/subscribe', () => {
    it('upgrades free user to pro', async () => {
      const res = await request(app).post('/api/v1/subscriptions/subscribe').set('Authorization', `Bearer ${freeToken}`).send({ plan: 'pro', months: 1 });
      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('pro');
      expect(res.body.data.expiresAt).toBeDefined();
    });

    it('rejects invalid plan', async () => {
      const res = await request(app).post('/api/v1/subscriptions/subscribe').set('Authorization', `Bearer ${freeToken}`).send({ plan: 'premium' });
      expect(res.status).toBe(400);
    });

    it('rejects subscribe without auth', async () => {
      const res = await request(app).post('/api/v1/subscriptions/subscribe').send({ plan: 'pro' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/subscriptions/cancel', () => {
    it('downgrades pro user to free', async () => {
      const res = await request(app).post('/api/v1/subscriptions/cancel').set('Authorization', `Bearer ${proToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('free');
      expect(res.body.data.limits.labSessions).toBe(2);
    });
  });

  describe('GET /api/v1/subscriptions/check/:feature', () => {
    it('denies advanced analytics for free user', async () => {
      const res = await request(app).get('/api/v1/subscriptions/check/advancedAnalytics').set('Authorization', `Bearer ${freeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.allowed).toBe(false);
    });

    it('allows advanced analytics for pro user', async () => {
      const res = await request(app).get('/api/v1/subscriptions/check/advancedAnalytics').set('Authorization', `Bearer ${proToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.allowed).toBe(true);
    });

    it('denies job posting for non-company user', async () => {
      const res = await request(app).get('/api/v1/subscriptions/check/jobPosting').set('Authorization', `Bearer ${freeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.allowed).toBe(false);
    });

    it('allows job posting for company user', async () => {
      const res = await request(app).get('/api/v1/subscriptions/check/jobPosting').set('Authorization', `Bearer ${companyToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.allowed).toBe(true);
    });
  });

  describe('Feature gating middleware', () => {
    it('blocks non-company from candidate search', async () => {
      const res = await request(app).get('/api/v1/company/candidates').set('Authorization', `Bearer ${freeToken}`);
      expect(res.status).toBe(403);
    });

    it('allows company role to access candidate search', async () => {
      const res = await request(app).get('/api/v1/company/candidates').set('Authorization', `Bearer ${companyToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.candidates).toBeInstanceOf(Array);
    });
  });

  describe('Company profile management', () => {
    it('gets company profile', async () => {
      const res = await request(app).get('/api/v1/company/profile').set('Authorization', `Bearer ${companyToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.companyProfile.companyName).toBe('TestCorp');
    });

    it('updates company profile', async () => {
      const res = await request(app).put('/api/v1/company/profile').set('Authorization', `Bearer ${companyToken}`).send({ website: 'https://testcorp.com', industry: 'Tech', size: '51-200' });
      expect(res.status).toBe(200);
      expect(res.body.data.website).toBe('https://testcorp.com');
    });

    it('rejects non-company role from company routes', async () => {
      const res = await request(app).get('/api/v1/company/profile').set('Authorization', `Bearer ${freeToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Plan limit enforcement on lab sessions', () => {
    it('blocks free user from creating lab session', async () => {
      const freshFree = await User.create({ fullname: { firstname: 'Fresh', lastname: 'Free' }, email: 'fresh@test.com', phone: '9000000005', dob: '1990-01-01', gender: 'Other', qualification: 'Degree', password: 'Test@1234' });
      const token = generateToken(freshFree);
      const res = await request(app).post('/api/v1/lab').set('Authorization', `Bearer ${token}`).send({ sessionType: 'code-server' });
      expect(res.status).toBe(403);
    });
  });

  describe('Expiry handling', () => {
    it('auto-downgrades expired pro user', async () => {
      const expiredUser = await User.create({ fullname: { firstname: 'Expired', lastname: 'User' }, email: 'expired@test.com', phone: '9000000006', dob: '1990-01-01', gender: 'Other', qualification: 'Degree', password: 'Test@1234', plan: 'pro', planExpiresAt: new Date(Date.now() - 86400000) });
      const result = expiredUser.hasPlan('pro');
      expect(result).toBe(false);
      expect(expiredUser.plan).toBe('free');
    });
  });
});
