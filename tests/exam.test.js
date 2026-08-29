const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamResult = require('../models/ExamResult');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(90000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_exam';

let adminToken;
let userToken;
let examId;
let questionIds;

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all([User, Exam, Question, ExamResult].map((model) => model.init()));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Exam.deleteMany({}),
    Question.deleteMany({}),
    ExamResult.deleteMany({}),
  ]);

  const admin = await User.create({
    fullname: { firstname: 'Admin', lastname: 'UniSphere' },
    email: 'admin@unisphere.com',
    phone: '9999999999',
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Admin123!',
    role: 'admin',
  });

  const appUser = await User.create({
    fullname: { firstname: 'Test', lastname: 'User' },
    email: 'test@unisphere.com',
    phone: '8888888888',
    dob: '1995-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'User123!',
    role: 'user',
  });

  adminToken = generateToken(admin._id);
  userToken = generateToken(appUser._id);

  const exam = await Exam.create({
    title: 'UniSphere Aptitude Test',
    description: 'Sample aptitude exam',
    category: 'Aptitude',
    qualification: 'Degree',
    durationMinutes: 30,
    totalMarks: 30,
    passingMarks: 20,
    lastDate: new Date('2030-12-31'),
    status: 'Active',
  });

  examId = exam._id;

  const created = await Question.insertMany([
    { examId, question: 'Question one', options: ['A', 'B', 'C'], correctAnswer: 0, marks: 10 },
    { examId, question: 'Question two', options: ['A', 'B', 'C'], correctAnswer: 1, marks: 10 },
    { examId, question: 'Question three', options: ['A', 'B', 'C'], correctAnswer: 2, marks: 10 },
  ]);

  questionIds = created.map((q) => q._id.toString());
});

describe('Exams API', () => {
  it('should list exams publicly', async () => {
    const res = await request(app).get('/api/v1/exams');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.exams)).toBe(true);
    expect(res.body.data.exams.length).toBeGreaterThan(0);
  });

  it('should require auth to fetch questions', async () => {
    const res = await request(app).get(`/api/v1/exams/${examId}/questions`);
    expect(res.status).toBe(401);
  });

  it('should fetch questions without exposing correct answers', async () => {
    const res = await request(app)
      .get(`/api/v1/exams/${examId}/questions`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBe(3);
    res.body.data.questions.forEach((q) => {
      expect(q).not.toHaveProperty('correctAnswer');
    });
  });

  it('should grade a passed submission correctly', async () => {
    const res = await request(app)
      .post(`/api/v1/exams/${examId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: questionIds.map((id, index) => ({
          questionId: id,
          selectedOption: index,
        })),
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Passed');
    expect(res.body.data.score).toBe(30);
    expect(res.body.data.totalMarks).toBe(30);
    expect(res.body.data.percentage).toBe(100);
  });

  it('should reject duplicate submission for the same exam', async () => {
    const first = await request(app)
      .post(`/api/v1/exams/${examId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: questionIds.map((id, index) => ({
          questionId: id,
          selectedOption: index,
        })),
      });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/v1/exams/${examId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: questionIds.map((id, index) => ({
          questionId: id,
          selectedOption: index,
        })),
      });
    expect(second.status).toBe(400);
  });

  it('should mark an exam as failed when below passing marks', async () => {
    const correctAnswers = [0, 1, 2];
    const res = await request(app)
      .post(`/api/v1/exams/${examId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: questionIds.map((id, index) => ({
          questionId: id,
          selectedOption: (correctAnswers[index] + 1) % 3,
        })),
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Failed');
    expect(res.body.data.score).toBe(0);
  });

  it('should return the users exam results', async () => {
    await request(app)
      .post(`/api/v1/exams/${examId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: questionIds.map((id, index) => ({
          questionId: id,
          selectedOption: index,
        })),
      });

    const res = await request(app)
      .get('/api/v1/exams/results')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('Passed');
  });

  it('should let admins view exam results', async () => {
    await request(app)
      .post(`/api/v1/exams/${examId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: questionIds.map((id, index) => ({
          questionId: id,
          selectedOption: index,
        })),
      });

    const res = await request(app)
      .get('/api/v1/admin/exam-results')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.results.length).toBe(1);
  });

  it('should block non-admin users from creating exams', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Blocked Exam',
        description: 'Should be blocked',
        category: 'Test',
        qualification: 'Degree',
        durationMinutes: 10,
        totalMarks: 10,
        passingMarks: 5,
        lastDate: '2030-12-31',
      });
    expect(res.status).toBe(403);
  });
});
