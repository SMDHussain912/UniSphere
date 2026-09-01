const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Use a test database
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_auth';

jest.setTimeout(120000);

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  describe('GET /api/v1/auth/captcha', () => {
    it('should return an SVG captcha', async () => {
      const res = await request(app).get('/api/v1/auth/captcha');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('image/svg+xml');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 if captcha is missing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        dob: '2000-01-01',
        gender: 'Male',
        qualification: 'Degree',
        password: 'Password123!',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if captcha is missing', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'Password123!',
      });
      expect(res.status).toBe(400);
    });
  });
});

describe('Jobs API', () => {
  describe('GET /api/v1/jobs', () => {
    it('should return all jobs', async () => {
      const res = await request(app).get('/api/v1/jobs');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
    });
  });
});

describe('Health Check', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('running');
    });
  });
});
