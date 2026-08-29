const courseLoader = require('../utils/courseLoader');
const CourseProgress = require('../models/CourseProgress');
const { awardPoints } = require('../utils/points');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const courseMeta = (course) => ({
  slug: course.slug,
  title: course.title,
  description: course.description,
  category: course.category,
  level: course.level,
  tags: course.tags,
  estimatedHours: course.estimatedHours,
  lessonCount: course.lessonCount,
  totalMinutes: course.totalMinutes,
  quizCount: course.modules.filter((moduleItem) => moduleItem.quiz).length,
});

const courseDetail = (course) => ({
  slug: course.slug,
  title: course.title,
  description: course.description,
  category: course.category,
  level: course.level,
  tags: course.tags,
  estimatedHours: course.estimatedHours,
  lessonCount: course.lessonCount,
  totalMinutes: course.totalMinutes,
  modules: course.modules.map((moduleItem) => ({
    title: moduleItem.title,
    quiz: moduleItem.quiz
      ? { title: moduleItem.quiz.title, questionCount: moduleItem.quiz.questions.length }
      : null,
    lessons: moduleItem.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      durationMinutes: lesson.durationMinutes,
      starterCode: lesson.starterCode || '',
    })),
  })),
});

const getCourses = asyncHandler(async (req, res) => {
  const { q, category, level, page = 1, limit = 12 } = req.query;
  const all = courseLoader.getCourses();

  let filtered = all;
  if (category && category !== 'all') {
    filtered = filtered.filter((course) => course.category === category);
  }
  if (level && level !== 'all') {
    filtered = filtered.filter((course) => course.level === level);
  }
  if (q) {
    const needle = String(q).toLowerCase();
    filtered = filtered.filter(
      (course) =>
        course.title.toLowerCase().includes(needle) ||
        course.description.toLowerCase().includes(needle) ||
        course.tags.some((tag) => tag.toLowerCase().includes(needle))
    );
  }

  const total = filtered.length;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paged = filtered.slice(skip, skip + parseInt(limit)).map(courseMeta);

  return success(res, {
    data: {
      courses: paged,
      categories: [...new Set(all.map((course) => course.category))].sort(),
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
    message: 'Courses retrieved successfully.',
  });
});

const getCourse = asyncHandler(async (req, res, next) => {
  const course = courseLoader.getCourse(req.params.slug);

  if (!course) {
    return next(new AppError('Course not found', 404, `No course exists with slug ${req.params.slug}`));
  }

  return success(res, {
    data: { course: courseDetail(course) },
    message: 'Course retrieved successfully.',
  });
});

const getMyProgress = asyncHandler(async (req, res) => {
  const progress = await CourseProgress.find({ userId: req.user._id }).sort({ updatedAt: -1 });

  return success(res, {
    data: { progress },
    message: 'Course progress retrieved successfully.',
  });
});

const completeLesson = asyncHandler(async (req, res, next) => {
  const course = courseLoader.getCourse(req.params.slug);

  if (!course) {
    return next(new AppError('Course not found', 404, `No course exists with slug ${req.params.slug}`));
  }

  const lessonId = req.params.lessonId;
  const lessonExists = course.modules.some((moduleItem) =>
    moduleItem.lessons.some((lesson) => lesson.id === lessonId)
  );

  if (!lessonExists) {
    return next(new AppError('Lesson not found in this course', 404));
  }

  let progress = await CourseProgress.findOne({
    userId: req.user._id,
    courseSlug: course.slug,
  });

  if (!progress) {
    progress = await CourseProgress.create({
      userId: req.user._id,
      courseSlug: course.slug,
      completedLessons: [],
    });
  }

  let pointsAwarded = 0;
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    pointsAwarded += 5;
  }

  progress.percent = Math.round((progress.completedLessons.length / course.lessonCount) * 100);

  let courseCompleted = false;
  if (progress.completedLessons.length >= course.lessonCount && !progress.completedAt) {
    progress.completedAt = new Date();
    pointsAwarded += 50;
    courseCompleted = true;
  }

  await progress.save();

  if (pointsAwarded > 0) {
    await awardPoints(req.user._id, pointsAwarded, `course progress on ${course.slug}`, 'learningPoints');
  }

  return success(res, {
    data: { progress, pointsAwarded, courseCompleted },
    message: courseCompleted ? 'Congratulations, course completed.' : 'Lesson progress saved.',
  });
});

module.exports = {
  getCourses,
  getCourse,
  getMyProgress,
  completeLesson,
};