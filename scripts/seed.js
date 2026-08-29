const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Job = require('../models/Jobs');
const News = require('../models/News');
const ExamCenter = require('../models/ExamCenter');
const ExamEnrollment = require('../models/ExamEnrollment');
const HallTicket = require('../models/HallTicket');

const run = async () => {
  await mongoose.connect(config.mongoUrl);

  const staff = [
    { firstname: 'UniSphere', lastname: 'Admin', email: 'admin@unisphere.com', phone: '9000000001', role: 'admin' },
    { firstname: 'UniSphere', lastname: 'SuperAdmin', email: 'superadmin@unisphere.com', phone: '9000000006', role: 'superadmin' },
    { firstname: 'Exam', lastname: 'Officer', email: 'exam@unisphere.com', phone: '9000000002', role: 'exam_admin' },
    { firstname: 'Question', lastname: 'Setter', email: 'questions@unisphere.com', phone: '9000000003', role: 'question_admin' },
    { firstname: 'Hall', lastname: 'Ticket', email: 'hallticket@unisphere.com', phone: '9000000004', role: 'hallticket_admin' },
    { firstname: 'Answer', lastname: 'Evaluator', email: 'grader@unisphere.com', phone: '9000000005', role: 'grader_admin' },
  ];

  for (const member of staff) {
    const exists = await User.findOne({ email: member.email });
    if (!exists) {
      await User.create({
        fullname: { firstname: member.firstname, lastname: member.lastname },
        email: member.email,
        phone: member.phone,
        dob: '1990-01-01',
        gender: 'Other',
        qualification: 'Degree',
        password: 'UniSphere@123',
        role: member.role,
      });
    }
  }

  if ((await ExamCenter.countDocuments()) === 0) {
    await ExamCenter.create([
      { name: 'UniSphere Central Examination Hall', code: 'UTC01', address: 'Plot 12, Tech Park Road, Madhapur', city: 'Hyderabad', capacity: 300 },
      { name: 'UniSphere Test Center Vijayawada', code: 'UTV02', address: 'Door 4-2, MG Road, Labbipet', city: 'Vijayawada', capacity: 200 },
    ]);
  }

  if ((await Exam.countDocuments()) === 0) {
    const exam1 = await Exam.create({
      title: 'UniSphere Aptitude Test 2026',
      description: 'General aptitude and reasoning test for entry-level roles.',
      category: 'Aptitude',
      qualification: 'Degree',
      durationMinutes: 30,
      totalMarks: 30,
      passingMarks: 20,
      vacancies: 25,
      applicationFee: 100,
      examDate: new Date('2026-10-15'),
      lastDate: new Date('2026-09-30'),
      syllabus: 'Quantitative aptitude, logical reasoning, verbal ability.',
      examPattern: '30 objective questions, 1 mark each.',
      status: 'Active',
    });
    const exam2 = await Exam.create({
      title: 'UniSphere Technical Assessment 2026',
      description: 'Technical assessment covering programming fundamentals.',
      category: 'Technical',
      qualification: 'B.Tech',
      durationMinutes: 60,
      totalMarks: 60,
      passingMarks: 36,
      vacancies: 15,
      applicationFee: 200,
      examDate: new Date('2026-10-20'),
      lastDate: new Date('2026-10-05'),
      syllabus: 'Data structures, algorithms, basics of DBMS and networks.',
      examPattern: '60 objective questions, 1 mark each.',
      status: 'Active',
    });
    await Question.insertMany([
      { examId: exam1._id, question: 'What is the next number in the series 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correctAnswer: 1, marks: 1 },
      { examId: exam1._id, question: 'If a train travels 240 km in 3 hours, what is its speed?', options: ['60 km/h', '70 km/h', '80 km/h', '90 km/h'], correctAnswer: 2, marks: 1 },
      { examId: exam1._id, question: 'Which number is the odd one out in 3, 5, 7, 9, 11?', options: ['3', '5', '9', '11'], correctAnswer: 2, marks: 1 },
    ]);
    await Question.insertMany([
      { examId: exam2._id, question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 1, marks: 1 },
      { examId: exam2._id, question: 'Which data structure uses FIFO ordering?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 1, marks: 1 },
    ]);
  }

  if ((await Job.countDocuments()) === 0) {
    await Job.create([
      {
        id: 1,
        title: 'Software Engineer',
        organization: 'UniSphere',
        category: 'Technology',
        status: 'Active',
        description: 'Develop and maintain web applications using modern JavaScript frameworks.',
        qualification: 'B.Tech or equivalent',
        experienceRequired: '0-2 years',
        salary: '6-10 LPA',
        vacancies: 5,
        employmentType: 'Full Time',
        skills: ['React', 'Node.js', 'MongoDB'],
        lastDate: new Date('2026-10-10'),
        location: 'Hyderabad',
      },
      {
        id: 2,
        title: 'Operations Analyst',
        organization: 'UniSphere',
        category: 'Operations',
        status: 'Active',
        description: 'Support daily operations and process improvement initiatives.',
        qualification: 'Degree',
        experienceRequired: 'Fresher',
        salary: '3-5 LPA',
        vacancies: 8,
        employmentType: 'Full Time',
        skills: ['Excel', 'Analytics'],
        lastDate: new Date('2026-10-15'),
        location: 'Vijayawada',
      },
    ]);
  }

  if ((await News.countDocuments()) === 0) {
    await News.create([
      { title: 'UniSphere Aptitude Test applications now open', category: 'Exams', description: 'Applications are being accepted until the last date. Visit the Exams section to get started.' },
      { title: 'New role openings announced', category: 'Jobs', description: 'Software Engineer and Operations Analyst positions are now open for applications.' },
    ]);
  }

  const counts = {
    users: await User.countDocuments(),
    exams: await Exam.countDocuments(),
    questions: await Question.countDocuments(),
    jobs: await Job.countDocuments(),
    news: await News.countDocuments(),
    centers: await ExamCenter.countDocuments(),
    enrollments: await ExamEnrollment.countDocuments(),
    hallTickets: await HallTicket.countDocuments(),
  };
  console.log('Seeded data:', JSON.stringify(counts));
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
