const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const logger = require('../config/logger');

const COURSES_DIR = path.join(__dirname, '..', 'content', 'courses');
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let cache = new Map();
let watcher = null;
let debounceTimer = null;

const fail = (file, message) => {
  throw new Error(`Invalid course file "${file}": ${message}`);
};

const validateQuiz = (quiz, file, context) => {
  if (!quiz.title || typeof quiz.title !== 'string') {
    fail(file, `${context} quiz requires a title`);
  }
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    fail(file, `${context} quiz requires at least one question`);
  }
  quiz.questions.forEach((question, index) => {
    const qctx = `${context} quiz question ${index + 1}`;
    if (!question.question || typeof question.question !== 'string') {
      fail(file, `${qctx} requires text`);
    }
    if (
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      question.options.length > 6
    ) {
      fail(file, `${qctx} must have between 2 and 6 options`);
    }
    if (
      !Number.isInteger(question.correctAnswer) ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      fail(file, `${qctx} has an invalid correctAnswer index`);
    }
    if (
      question.marks !== undefined &&
      (!Number.isInteger(question.marks) || question.marks < 1)
    ) {
      fail(file, `${qctx} marks must be a positive integer`);
    }
  });
};

const validateCourse = (course, file) => {
  if (!course || typeof course !== 'object') {
    fail(file, 'file must contain a YAML object');
  }
  if (!course.slug || !SLUG_PATTERN.test(course.slug)) {
    fail(file, 'slug is required in lowercase-kebab format');
  }
  const expected = path.basename(file).replace(/\.(yml|yaml)$/, '');
  if (course.slug !== expected) {
    fail(file, `slug "${course.slug}" must match the file name "${expected}.yml"`);
  }
  if (!course.title || typeof course.title !== 'string') {
    fail(file, 'title is required');
  }
  if (!course.description || typeof course.description !== 'string') {
    fail(file, 'description is required');
  }
  if (!course.category || typeof course.category !== 'string') {
    fail(file, 'category is required');
  }
  if (!LEVELS.includes(course.level)) {
    fail(file, `level must be one of: ${LEVELS.join(', ')}`);
  }
  if (!Array.isArray(course.tags)) course.tags = [];
  if (!Number.isInteger(course.estimatedHours) || course.estimatedHours < 1) {
    course.estimatedHours = 1;
  }
  if (!Array.isArray(course.modules) || course.modules.length === 0) {
    fail(file, 'at least one module is required');
  }
  course.modules.forEach((moduleItem, moduleIndex) => {
    const mctx = `module ${moduleIndex + 1}`;
    if (!moduleItem || typeof moduleItem !== 'object') {
      fail(file, `${mctx} must be an object`);
    }
    if (!moduleItem.title || typeof moduleItem.title !== 'string') {
      fail(file, `${mctx} requires a title`);
    }
    if (!Array.isArray(moduleItem.lessons) || moduleItem.lessons.length === 0) {
      fail(file, `${mctx} requires at least one lesson`);
    }
    moduleItem.lessons.forEach((lesson, lessonIndex) => {
      const lctx = `${mctx} lesson ${lessonIndex + 1}`;
      if (!lesson || typeof lesson !== 'object') {
        fail(file, `${lctx} must be an object`);
      }
      if (!lesson.title || typeof lesson.title !== 'string') {
        fail(file, `${lctx} requires a title`);
      }
      if (lesson.content === undefined) lesson.content = '';
      if (typeof lesson.content !== 'string') {
        fail(file, `${lctx} content must be text`);
      }
      if (
        lesson.durationMinutes !== undefined &&
        (!Number.isInteger(lesson.durationMinutes) || lesson.durationMinutes < 1)
      ) {
        fail(file, `${lctx} durationMinutes must be a positive integer`);
      }
    });
    if (moduleItem.quiz) {
      validateQuiz(moduleItem.quiz, file, mctx);
    }
  });
};

const normalize = (course) => {
  let lessonCount = 0;
  let totalMinutes = 0;
  course.modules.forEach((moduleItem, moduleIndex) => {
    moduleItem.lessons.forEach((lesson, lessonIndex) => {
      lesson.id = `m${moduleIndex}-l${lessonIndex}`;
      lessonCount += 1;
      totalMinutes += lesson.durationMinutes || 0;
    });
  });
  course.lessonCount = lessonCount;
  course.totalMinutes = totalMinutes;
  return course;
};

const loadAll = () => {
  const next = new Map();
  const files = fs.existsSync(COURSES_DIR)
    ? fs
        .readdirSync(COURSES_DIR)
        .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
        .sort()
    : [];

  files.forEach((file) => {
    const raw = yaml.load(fs.readFileSync(path.join(COURSES_DIR, file), 'utf8'));
    validateCourse(raw, file);
    next.set(raw.slug, normalize(raw));
  });

  cache = next;
  return Array.from(cache.values());
};

const startWatch = () => {
  if (watcher || !fs.existsSync(COURSES_DIR)) return;
  watcher = fs.watch(COURSES_DIR, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        loadAll();
        logger.info(`Course catalog reloaded: ${cache.size} courses`);
      } catch (error) {
        logger.error(`Course reload failed, keeping previous catalog: ${error.message}`);
      }
    }, 300);
  });
};

const init = () => {
  loadAll();
  startWatch();
  return Array.from(cache.values());
};

const getCourses = () => {
  if (cache.size === 0) loadAll();
  return Array.from(cache.values());
};

const getCourse = (slug) => {
  if (cache.size === 0) loadAll();
  return cache.get(slug) || null;
};

const getCount = () => {
  if (cache.size === 0) loadAll();
  return cache.size;
};

module.exports = { init, loadAll, getCourses, getCourse, getCount, COURSES_DIR };