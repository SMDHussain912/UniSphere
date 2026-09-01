const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const courseLoader = require('../utils/courseLoader');
const { awardPoints } = require('../utils/points');
const { awardXp, checkAchievements } = require('./gamificationController');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const stripAnswers = (quiz) => ({
  _id: quiz._id,
  key: quiz.key,
  courseSlug: quiz.courseSlug,
  moduleId: quiz.moduleId,
  title: quiz.title,
  totalMarks: quiz.totalMarks,
  passPercent: quiz.passPercent,
  questions: quiz.questions.map((question) => ({
    question: question.question,
    options: question.options,
    marks: question.marks,
  })),
});

const syncQuizzes = async () => {
  const courses = courseLoader.getCourses();

  for (const course of courses) {
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex += 1) {
      const moduleItem = course.modules[moduleIndex];
      if (!moduleItem.quiz) continue;

      const key = `${course.slug}:m${moduleIndex}`;
      const questions = moduleItem.quiz.questions.map((question) => ({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        marks: question.marks || 1,
      }));
      const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);

      await Quiz.findOneAndUpdate(
        { key },
        {
          key,
          courseSlug: course.slug,
          moduleId: moduleIndex,
          title: moduleItem.quiz.title,
          questions,
          totalMarks,
          passPercent: moduleItem.quiz.passPercent || 60,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
};

const getCourseQuizzes = asyncHandler(async (req, res, next) => {
  const course = courseLoader.getCourse(req.params.slug);

  if (!course) {
    return next(new AppError('Course not found', 404, `No course exists with slug ${req.params.slug}`));
  }

  let quizzes = await Quiz.find({ courseSlug: course.slug }).sort({ moduleId: 1 });

  if (quizzes.length === 0) {
    await syncQuizzes();
    quizzes = await Quiz.find({ courseSlug: course.slug }).sort({ moduleId: 1 });
  }

  return success(res, {
    data: { quizzes: quizzes.map(stripAnswers) },
    message: 'Course quizzes retrieved successfully.',
  });
});

const submitAttempt = asyncHandler(async (req, res, next) => {
  const { answers } = req.body;

  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    await syncQuizzes();
    quiz = await Quiz.findById(req.params.id);
  }

  if (!quiz) {
    return next(new AppError('Quiz not found', 404, `No quiz exists with id ${req.params.id}`));
  }

  const previousBest = await QuizAttempt.findOne({
    userId: req.user._id,
    quizId: quiz._id,
  })
    .sort({ score: -1 })
    .select('score');

  let score = 0;
  quiz.questions.forEach((question, index) => {
    const answer = answers.find((item) => item.questionIndex === index);
    if (
      answer &&
      Number.isInteger(answer.selected) &&
      answer.selected === question.correctAnswer
    ) {
      score += question.marks;
    }
  });

  const totalMarks = quiz.totalMarks;
  const percent = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const passed = percent >= quiz.passPercent;

  const attempt = await QuizAttempt.create({
    userId: req.user._id,
    quizId: quiz._id,
    courseSlug: quiz.courseSlug,
    answers,
    score,
    totalMarks,
    percent,
    passed,
  });

  const bestScore = Math.max(previousBest ? previousBest.score : 0, score);
  const pointsAwarded = Math.max(0, Math.floor((bestScore - (previousBest ? previousBest.score : 0)) / 2));

  if (pointsAwarded > 0) {
    await awardPoints(req.user._id, pointsAwarded, `quiz ${quiz.key}`, 'learningPoints');
  }

  let xpAwarded = 0;
  if (passed) {
    xpAwarded = percent >= 90 ? 40 : 25;
    await awardXp(req.user._id, xpAwarded, `quiz: ${quiz.key}`);
    await checkAchievements(req.user._id);
  }

  return success(res, {
    data: {
      attempt: {
        _id: attempt._id,
        score,
        totalMarks,
        percent,
        passed,
      },
      pointsAwarded,
      xpAwarded,
      isBestScore: score >= (previousBest ? previousBest.score : 0),
    },
    message: passed ? 'Quiz passed. Well done.' : 'Quiz submitted. Keep practicing.',
  });
});

const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({
    userId: req.user._id,
    quizId: req.params.id,
  }).sort({ createdAt: -1 });

  return success(res, {
    data: { attempts },
    message: 'Quiz attempts retrieved successfully.',
  });
});

module.exports = {
  getCourseQuizzes,
  submitAttempt,
  getMyAttempts,
};