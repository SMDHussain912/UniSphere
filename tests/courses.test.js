const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const CourseProgress = require('../models/CourseProgress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const courseLoader = require('../utils/courseLoader');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(120000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_courses';

let token;
let user;

const createUser = () =>
  User.create({
    fullname: { firstname: 'Learner', lastname: 'UniSphere' },
    email: 'learner.courses@unisphere.com',
    phone: '9000000071',
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Test@1234',
    role: 'user',
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all(
    [User, CourseProgress, Quiz, QuizAttempt].map((model) => model.init())
  );
  courseLoader.loadAll();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    CourseProgress.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
  ]);
  user = await createUser();
  token = generateToken(user._id);
});

describe('Course catalog', () => {
  it('exposes the loaded catalog through the loader', () => {
    const courses = courseLoader.getCourses();
    expect(courses).toHaveLength(4);
    courses.forEach((course) => {
      expect(course).toHaveProperty('slug');
      expect(course).toHaveProperty('lessonCount');
      expect(course.modules.length).toBeGreaterThan(0);
    });
    expect(courseLoader.getCourse('does-not-exist')).toBeNull();
  });

  it('lists courses publicly with filters and pagination', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.status).toBe(200);
    expect(res.body.data.courses).toHaveLength(4);
    expect(res.body.data.categories).toContain('Programming');
    expect(res.body.data.pagination.totalItems).toBe(4);

    const search = await request(app).get('/api/v1/courses?q=react');
    expect(search.status).toBe(200);
    expect(search.body.data.courses).toHaveLength(1);
    expect(search.body.data.courses[0].slug).toBe('react-essentials');

    const level = await request(app).get('/api/v1/courses?level=Beginner');
    expect(level.status).toBe(200);
    expect(level.body.data.courses).toHaveLength(2);

    const invalidLevel = await request(app).get('/api/v1/courses?level=Expert');
    expect(invalidLevel.status).toBe(400);
  });

  it('returns course detail without leaking quiz answers', async () => {
    const res = await request(app).get('/api/v1/courses/javascript-fundamentals');
    expect(res.status).toBe(200);
    const course = res.body.data.course;
    expect(course.title).toBe('JavaScript Fundamentals');
    expect(course.lessonCount).toBe(6);
    expect(course.modules).toHaveLength(2);
    expect(course.modules[0].lessons[0]).toHaveProperty('content');
    expect(course.modules[0].quiz.questionCount).toBeGreaterThan(0);
    expect(JSON.stringify(course)).not.toContain('correctAnswer');

    const missing = await request(app).get('/api/v1/courses/nope-course');
    expect(missing.status).toBe(404);
  });
});

describe('Course progress and points', () => {
  it('requires authentication to track progress', async () => {
    const res = await request(app)
      .post('/api/v1/courses/sql-basics/lessons/m0-l0/complete');
    expect(res.status).toBe(401);
  });

  it('tracks lesson completion and awards points exactly once', async () => {
    const slug = 'sql-basics';
    const lessons = ['m0-l0', 'm0-l1', 'm1-l0', 'm1-l1'];

    const first = await request(app)
      .post(`/api/v1/courses/${slug}/lessons/m0-l0/complete`)
      .set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.data.pointsAwarded).toBe(5);
    expect(first.body.data.progress.percent).toBe(25);

    const duplicate = await request(app)
      .post(`/api/v1/courses/${slug}/lessons/m0-l0/complete`)
      .set('Authorization', `Bearer ${token}`);
    expect(duplicate.status).toBe(200);
    expect(duplicate.body.data.pointsAwarded).toBe(0);

    for (const lessonId of lessons.slice(1)) {
      await request(app)
        .post(`/api/v1/courses/${slug}/lessons/${lessonId}/complete`)
        .set('Authorization', `Bearer ${token}`);
    }

    const refreshed = await User.findById(user._id).select('learningPoints');
    expect(refreshed.learningPoints).toBe(70);

    const list = await request(app)
      .get('/api/v1/courses/my/progress')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.progress).toHaveLength(1);
    expect(list.body.data.progress[0].percent).toBe(100);
    expect(list.body.data.progress[0].completedAt).toBeTruthy();

    const unknownLesson = await request(app)
      .post(`/api/v1/courses/${slug}/lessons/m9-l9/complete`)
      .set('Authorization', `Bearer ${token}`);
    expect(unknownLesson.status).toBe(404);
  });
});

describe('Course quizzes', () => {
  it('requires authentication to view quizzes', async () => {
    const res = await request(app).get('/api/v1/quizzes/course/javascript-fundamentals');
    expect(res.status).toBe(401);
  });

  it('hides answers, grades attempts and awards improvement points', async () => {
    const quizList = await request(app)
      .get('/api/v1/quizzes/course/javascript-fundamentals')
      .set('Authorization', `Bearer ${token}`);
    expect(quizList.status).toBe(200);
    const quizzes = quizList.body.data.quizzes;
    expect(quizzes).toHaveLength(2);
    const quiz = quizzes[0];
    expect(quiz.questions).toHaveLength(3);
    expect(JSON.stringify(quiz)).not.toContain('correctAnswer');

    const submit = await request(app)
      .post(`/api/v1/quizzes/${quiz._id}/attempt`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        answers: [
          { questionIndex: 0, selected: 2 },
          { questionIndex: 1, selected: 1 },
          { questionIndex: 2, selected: 0 },
        ],
      });
    expect(submit.status).toBe(200);
    expect(submit.body.data.attempt.score).toBe(2);
    expect(submit.body.data.attempt.percent).toBe(67);
    expect(submit.body.data.attempt.passed).toBe(true);
    expect(submit.body.data.pointsAwarded).toBe(1);

    const retake = await request(app)
      .post(`/api/v1/quizzes/${quiz._id}/attempt`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        answers: [
          { questionIndex: 0, selected: 2 },
          { questionIndex: 1, selected: 1 },
          { questionIndex: 2, selected: 1 },
        ],
      });
    expect(retake.status).toBe(200);
    expect(retake.body.data.attempt.score).toBe(3);
    expect(retake.body.data.isBestScore).toBe(true);
    expect(retake.body.data.pointsAwarded).toBe(0);

    const worse = await request(app)
      .post(`/api/v1/quizzes/${quiz._id}/attempt`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        answers: [
          { questionIndex: 0, selected: 0 },
          { questionIndex: 1, selected: 0 },
          { questionIndex: 2, selected: 0 },
        ],
      });
    expect(worse.status).toBe(200);
    expect(worse.body.data.attempt.score).toBe(0);
    expect(worse.body.data.pointsAwarded).toBe(0);

    const attempts = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}/attempts/mine`)
      .set('Authorization', `Bearer ${token}`);
    expect(attempts.status).toBe(200);
    expect(attempts.body.data.attempts).toHaveLength(3);

    const invalid = await request(app)
      .post(`/api/v1/quizzes/${quiz._id}/attempt`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(invalid.status).toBe(400);

    const unknownQuiz = await request(app)
      .post('/api/v1/quizzes/507f1f77bcf86cd799439011/attempt')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [{ questionIndex: 0, selected: 0 }] });
    expect(unknownQuiz.status).toBe(404);
  });
});