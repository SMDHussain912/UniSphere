const config = require('../config/env');
const LabSession = require('../models/LabSession');
const dockerRunner = require('../utils/dockerRunner');
const { closeTerminalsForSession } = require('../utils/terminalGateway');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

const SESSION_TYPES = ['code-server', 'desktop'];

const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await LabSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return success(res, { data: sessions, message: 'Lab sessions retrieved successfully.' });
});

const getActiveSession = asyncHandler(async (req, res) => {
  const session = await LabSession.findOne({
    userId: req.user.id,
    status: LabSession.STATUS_ACTIVE,
  });
  return success(res, { data: session, message: 'Active session retrieved successfully.' });
});

const createSession = asyncHandler(async (req, res, next) => {
  if (!config.labEnabled) {
    return next(new AppError('Lab is currently disabled', 503));
  }

  const sessionType = req.body.sessionType || 'code-server';
  if (!SESSION_TYPES.includes(sessionType)) {
    return next(new AppError('Invalid session type. Must be code-server or desktop.', 400));
  }

  const activeCount = await LabSession.countDocuments({
    userId: req.user.id,
    status: LabSession.STATUS_ACTIVE,
  });
  if (activeCount >= 1) {
    return next(new AppError('You already have an active session. Stop it before starting a new one.', 400));
  }

  const planLimits = req.user.planLimits || req.user.resolveLimits();
  if (!req.user.hasPlan('pro') || planLimits.labSessions === 0) {
    return next(new AppError('Lab sessions require a Pro plan. Upgrade to access cloud labs.', 403));
  }

  const globalCount = await LabSession.countDocuments({ status: LabSession.STATUS_ACTIVE });
  if (globalCount >= config.labMaxSessions) {
    return next(new AppError('All lab sessions are in use. Try again shortly.', 429));
  }

  if (!(await dockerRunner.isDockerAvailable())) {
    return next(new AppError('Lab infrastructure is unavailable', 503));
  }

  const { containerId, port, url } = await dockerRunner.createLabSession({
    userId: req.user.id,
    sessionType,
  });

  const expiresAt = new Date(Date.now() + config.labSessionTtlMinutes * 60 * 1000);

  const session = await LabSession.create({
    userId: req.user.id,
    sessionType,
    containerId,
    port,
    url,
    status: LabSession.STATUS_ACTIVE,
    expiresAt,
  });

  return success(res, {
    data: { session, timeRemainingMinutes: config.labSessionTtlMinutes },
    message: 'Lab session created successfully.',
    status: 201,
  });
});

const stopSession = asyncHandler(async (req, res, next) => {
  const session = await LabSession.findOne({
    _id: req.params.id,
    userId: req.user.id,
    status: LabSession.STATUS_ACTIVE,
  });
  if (!session) {
    return next(new AppError('Active session not found', 404));
  }

  if (session.containerId) {
    await dockerRunner.stopLabSession(session.containerId);
  }
  closeTerminalsForSession(String(session._id));

  session.status = LabSession.STATUS_STOPPED;
  session.stoppedAt = new Date();
  await session.save();

  return success(res, { data: session, message: 'Lab session stopped successfully.' });
});

const cleanupExpiredSessions = async () => {
  const expired = await LabSession.find({
    status: LabSession.STATUS_ACTIVE,
    expiresAt: { $lt: new Date() },
  });
  for (const session of expired) {
    if (session.containerId) {
      await dockerRunner.stopLabSession(session.containerId);
    }
    closeTerminalsForSession(String(session._id));
    session.status = LabSession.STATUS_EXPIRED;
    session.stoppedAt = new Date();
    await session.save();
  }
  return expired.length;
};

module.exports = {
  getMySessions,
  getActiveSession,
  createSession,
  stopSession,
  cleanupExpiredSessions,
};