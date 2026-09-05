const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamResult = require('../models/ExamResult');
const ExamEnrollment = require('../models/ExamEnrollment');
const HallTicket = require('../models/HallTicket');
const ExamCenter = require('../models/ExamCenter');
const QuestionPaper = require('../models/QuestionPaper');
const AnswerSheet = require('../models/AnswerSheet');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(300000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_workflow';

let tokens;
let exam;
let mcqIds;
let descQuestion;
let centerId;
let enrollmentId;
let paperId;
let sheetId;

const createUser = (firstname, role, phone) =>
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
  await Promise.all(
    [User, Exam, Question, ExamResult, ExamEnrollment, HallTicket, ExamCenter, QuestionPaper, AnswerSheet].map(
      (model) => model.init()
    )
  );
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
    ExamEnrollment.deleteMany({}),
    HallTicket.deleteMany({}),
    ExamCenter.deleteMany({}),
    QuestionPaper.deleteMany({}),
    AnswerSheet.deleteMany({}),
  ]);
  await mongoose.connection.db.collection('counters').deleteMany({});

  const [superadmin, admin, examAdmin, questionAdmin, hallticketAdmin, graderAdmin, candidate] =
    await Promise.all([
      createUser('Super', 'superadmin', '9000000001'),
      createUser('General', 'admin', '9000000002'),
      createUser('Exam', 'exam_admin', '9000000003'),
      createUser('Question', 'question_admin', '9000000004'),
      createUser('Hall', 'hallticket_admin', '9000000005'),
      createUser('Grader', 'grader_admin', '9000000006'),
      createUser('Candidate', 'user', '9000000007'),
    ]);

  tokens = {
    superadmin: generateToken(superadmin._id),
    admin: generateToken(admin._id),
    exam_admin: generateToken(examAdmin._id),
    question_admin: generateToken(questionAdmin._id),
    hallticket_admin: generateToken(hallticketAdmin._id),
    grader_admin: generateToken(graderAdmin._id),
    user: generateToken(candidate._id),
  };

  exam = await Exam.create({
    title: 'UniSphere Mixed Assessment',
    description: 'Mixed MCQ and descriptive exam',
    category: 'Technical',
    qualification: 'Degree',
    examType: 'Mixed',
    durationMinutes: 45,
    totalMarks: 30,
    passingMarks: 12,
    lastDate: new Date('2030-12-31'),
    status: 'Active',
  });

  const mcq = await Question.insertMany([
    { examId: exam._id, question: 'MCQ one', options: ['A', 'B', 'C'], correctAnswer: 0, marks: 10 },
    { examId: exam._id, question: 'MCQ two', options: ['A', 'B', 'C'], correctAnswer: 1, marks: 10 },
  ]);
  mcqIds = mcq.map((q) => q._id.toString());
  descQuestion = await Question.create({
    examId: exam._id,
    question: 'Explain database normalization.',
    questionType: 'Descriptive',
    marks: 10,
  });
});

describe('Exam selection workflow with separated admin roles', () => {
  it('runs the full enrollment, hall ticket, paper and grading pipeline', async () => {
    const centerRes = await request(app)
      .post('/api/v1/admin/exam-centers')
      .set('Authorization', `Bearer ${tokens.exam_admin}`)
      .send({
        name: 'UniSphere Test Center',
        code: 'UTC01',
        address: 'Tech Park Road',
        city: 'Hyderabad',
        capacity: 250,
      });
    expect(centerRes.status).toBe(201);
    centerId = centerRes.body.data._id;

    const enrollRes = await request(app)
      .post(`/api/v1/exams/${exam._id}/enroll`)
      .set('Authorization', `Bearer ${tokens.user}`)
      .send({ formData: { photo: 'uploads/photo.jpg', signature: 'uploads/sign.png' } });
    expect(enrollRes.status).toBe(201);
    expect(enrollRes.body.data.registrationNumber).toMatch(/^UTE\d{6}$/);
    enrollmentId = enrollRes.body.data._id;

    const duplicateRes = await request(app)
      .post(`/api/v1/exams/${exam._id}/enroll`)
      .set('Authorization', `Bearer ${tokens.user}`)
      .send({});
    expect(duplicateRes.status).toBe(400);

    const confirmRes = await request(app)
      .post(`/api/v1/admin/enrollments/${enrollmentId}/status`)
      .set('Authorization', `Bearer ${tokens.exam_admin}`)
      .send({ status: 'confirmed', centerId, feePaid: true });
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('confirmed');

    const ticketRes = await request(app)
      .post('/api/v1/admin/hall-tickets/generate')
      .set('Authorization', `Bearer ${tokens.hallticket_admin}`)
      .send({ enrollmentId });
    expect(ticketRes.status).toBe(201);
    expect(ticketRes.body.data.hallTicketNumber).toMatch(/^UHT\d{6}$/);

    const reprintRes = await request(app)
      .post('/api/v1/admin/hall-tickets/generate')
      .set('Authorization', `Bearer ${tokens.hallticket_admin}`)
      .send({ enrollmentId });
    expect(reprintRes.status).toBe(200);
    expect(reprintRes.body.data.status).toBe('reprinted');

    const myTicketsRes = await request(app)
      .get('/api/v1/hall-tickets/mine')
      .set('Authorization', `Bearer ${tokens.user}`);
    expect(myTicketsRes.status).toBe(200);
    expect(myTicketsRes.body.data.length).toBe(1);
    expect(myTicketsRes.body.data[0].venue).toContain('UniSphere Test Center');

    const paperRes = await request(app)
      .post('/api/v1/admin/question-papers')
      .set('Authorization', `Bearer ${tokens.question_admin}`)
      .send({ examId: exam._id.toString(), title: 'Set A Paper', paperType: 'Mixed', setCode: 'A', questions: mcqIds });
    expect(paperRes.status).toBe(201);
    expect(paperRes.body.data.totalMarks).toBe(20);
    paperId = paperRes.body.data._id;

    const keyRes = await request(app)
      .post(`/api/v1/admin/question-papers/${paperId}/answer-key`)
      .set('Authorization', `Bearer ${tokens.question_admin}`)
      .attach('answerKey', Buffer.from('mock answer key'), 'answer-key.pdf');
    expect(keyRes.status).toBe(200);
    expect(keyRes.body.data.answerKey.uploaded).toBe(true);

    const publishKeyRes = await request(app)
      .post(`/api/v1/admin/question-papers/${paperId}/answer-key/publish`)
      .set('Authorization', `Bearer ${tokens.question_admin}`);
    expect(publishKeyRes.status).toBe(200);
    expect(publishKeyRes.body.data.answerKey.published).toBe(true);

    const publishRes = await request(app)
      .put(`/api/v1/admin/question-papers/${paperId}/status`)
      .set('Authorization', `Bearer ${tokens.question_admin}`)
      .send({ status: 'Published' });
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe('Published');

    const questionsRes = await request(app)
      .get(`/api/v1/exams/${exam._id}/questions`)
      .set('Authorization', `Bearer ${tokens.user}`);
    expect(questionsRes.status).toBe(200);
    expect(questionsRes.body.data.questions.length).toBe(3);

    const submitRes = await request(app)
      .post(`/api/v1/exams/${exam._id}/submit`)
      .set('Authorization', `Bearer ${tokens.user}`)
      .send({
        answers: [
          { questionId: mcqIds[0], selectedOption: 0 },
          { questionId: mcqIds[1], selectedOption: 0 },
        ],
        descriptiveAnswers: [{ questionId: descQuestion._id.toString(), text: 'Normalization organizes columns and tables.' }],
      });
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.data.status).toBe('Pending');

    const sheetsRes = await request(app)
      .get('/api/v1/admin/grading?status=pending')
      .set('Authorization', `Bearer ${tokens.grader_admin}`);
    expect(sheetsRes.status).toBe(200);
    expect(sheetsRes.body.data.sheets.length).toBe(1);
    expect(sheetsRes.body.data.sheets[0].autoScore).toBe(10);
    sheetId = sheetsRes.body.data.sheets[0]._id;

    const sheetRes = await request(app)
      .get(`/api/v1/admin/grading/${sheetId}`)
      .set('Authorization', `Bearer ${tokens.grader_admin}`);
    expect(sheetRes.status).toBe(200);
    expect(sheetRes.body.data.answers.length).toBe(1);

    const scoreRes = await request(app)
      .post(`/api/v1/admin/grading/${sheetId}/score`)
      .set('Authorization', `Bearer ${tokens.grader_admin}`)
      .send({
        marks: [{ questionId: descQuestion._id.toString(), awarded: 8 }],
        feedback: 'Well structured answer',
      });
    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body.data.status).toBe('graded');
    expect(scoreRes.body.data.manualMarks).toBe(8);
    expect(scoreRes.body.data.totalMarks).toBe(18);

    const resultRes = await request(app)
      .get('/api/v1/exams/results')
      .set('Authorization', `Bearer ${tokens.user}`);
    expect(resultRes.status).toBe(200);
    const result = resultRes.body.data.find((r) => r.examId._id === exam._id.toString());
    expect(result.score).toBe(18);
    expect(result.status).toBe('Passed');

    const regradeRes = await request(app)
      .post(`/api/v1/admin/grading/${sheetId}/score`)
      .set('Authorization', `Bearer ${tokens.grader_admin}`)
      .send({ marks: [] });
    expect(regradeRes.status).toBe(400);
  });

  it('enforces role separation across admin workspaces', async () => {
    const graderCenterRes = await request(app)
      .post('/api/v1/admin/exam-centers')
      .set('Authorization', `Bearer ${tokens.grader_admin}`)
      .send({ name: 'Nope', code: 'NOPE1', address: 'X', city: 'Y' });
    expect(graderCenterRes.status).toBe(403);

    const graderPapersRes = await request(app)
      .get('/api/v1/admin/question-papers')
      .set('Authorization', `Bearer ${tokens.grader_admin}`);
    expect(graderPapersRes.status).toBe(403);

    const ticketAdminGradingRes = await request(app)
      .get('/api/v1/admin/grading')
      .set('Authorization', `Bearer ${tokens.hallticket_admin}`);
    expect(ticketAdminGradingRes.status).toBe(403);

    const questionAdminTicketRes = await request(app)
      .post('/api/v1/admin/hall-tickets/generate')
      .set('Authorization', `Bearer ${tokens.question_admin}`)
      .send({ enrollmentId: '507f1f77bcf86cd799439011' });
    expect(questionAdminTicketRes.status).toBe(403);

    const enrollmentsRes = await request(app)
      .get('/api/v1/admin/enrollments')
      .set('Authorization', `Bearer ${tokens.exam_admin}`);
    expect(enrollmentsRes.status).toBe(200);

    const userAdminRes = await request(app)
      .get('/api/v1/admin/grading')
      .set('Authorization', `Bearer ${tokens.user}`);
    expect(userAdminRes.status).toBe(403);

    const statsRes = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${tokens.hallticket_admin}`);
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data).toHaveProperty('hallTicketsIssued');
    expect(statsRes.body.data).toHaveProperty('pendingAnswerSheets');
  });

  it('restricts admin account management to superadmin', async () => {
    const createRes = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${tokens.superadmin}`)
      .send({
        firstname: 'New',
        lastname: 'Grader',
        email: 'new.grader@unisphere.com',
        phone: '9000000099',
        dob: '1992-05-05',
        gender: 'Female',
        qualification: 'Degree',
        password: 'Grader@123',
        role: 'grader_admin',
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.role).toBe('grader_admin');

    const adminCreateRes = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        firstname: 'Sneaky',
        lastname: 'Admin',
        email: 'sneaky@unisphere.com',
        phone: '9000000098',
        dob: '1992-05-05',
        gender: 'Male',
        qualification: 'Degree',
        password: 'Sneak@123',
        role: 'superadmin',
      });
    expect(adminCreateRes.status).toBe(403);

    const listRes = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${tokens.superadmin}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(6);
    expect(listRes.body.data.every((member) => member.role !== 'user')).toBe(true);
  });

  it('lets superadmins deactivate staff accounts and reset passwords', async () => {
    const grader = await User.findOne({ email: 'grader.grader_admin@unisphere.com' });
    const superUser = await User.findOne({ email: 'super.superadmin@unisphere.com' });
    expect(grader).toBeTruthy();
    expect(superUser).toBeTruthy();

    const adminTries = await request(app)
      .post(`/api/v1/admin/admins/${grader._id}/status`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ active: false });
    expect(adminTries.status).toBe(403);

    const selfRes = await request(app)
      .post(`/api/v1/admin/admins/${superUser._id}/status`)
      .set('Authorization', `Bearer ${tokens.superadmin}`)
      .send({ active: false });
    expect(selfRes.status).toBe(400);
    expect(selfRes.body.message).toContain('own account');

    const deactRes = await request(app)
      .post(`/api/v1/admin/admins/${grader._id}/status`)
      .set('Authorization', `Bearer ${tokens.superadmin}`)
      .send({ active: false });
    expect(deactRes.status).toBe(200);
    expect(deactRes.body.data.active).toBe(false);

    const blockedRes = await request(app)
      .get('/api/v1/admin/grading')
      .set('Authorization', `Bearer ${tokens.grader_admin}`);
    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.message).toContain('deactivated');

    const reactivateRes = await request(app)
      .post(`/api/v1/admin/admins/${grader._id}/status`)
      .set('Authorization', `Bearer ${tokens.superadmin}`)
      .send({ active: true });
    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.data.active).toBe(true);

    const restoredRes = await request(app)
      .get('/api/v1/admin/grading')
      .set('Authorization', `Bearer ${tokens.grader_admin}`);
    expect(restoredRes.status).toBe(200);

    const resetRes = await request(app)
      .post(`/api/v1/admin/admins/${grader._id}/reset-password`)
      .set('Authorization', `Bearer ${tokens.superadmin}`)
      .send({ password: 'NewGrader@123' });
    expect(resetRes.status).toBe(200);

    const updated = await User.findById(grader._id).select('+password');
    expect(await updated.comparePassword('NewGrader@123')).toBe(true);
    expect(await updated.comparePassword('Test@1234')).toBe(false);
  });
});