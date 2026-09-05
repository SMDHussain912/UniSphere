const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

// Never leak emails/phones of the other participant in chat listings.
const PUBLIC_USER_FIELDS = 'fullname';

/**
 * @desc    Get all conversations for the current user
 * @route   GET /api/v1/chat/conversations
 * @access  Private
 */
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', PUBLIC_USER_FIELDS)
    .sort({ updatedAt: -1 });

  const data = conversations.map((c) => {
    const participant =
      c.participants.find((p) => p._id.toString() !== req.user._id.toString()) || null;
    return {
      _id: c._id,
      participant,
      lastMessage: c.lastMessage || '',
      lastMessageAt: c.lastMessageAt,
      updatedAt: c.updatedAt,
    };
  });

  return success(res, { data, message: 'Conversations retrieved successfully.' });
});

/**
 * @desc    Start (or fetch existing) DM conversation with another user
 * @route   POST /api/v1/chat/conversations
 * @access  Private
 */
const getOrCreateConversation = asyncHandler(async (req, res, next) => {
  const { participantId } = req.body;

  if (String(participantId) === String(req.user._id)) {
    return next(new AppError('You cannot start a conversation with yourself', 400));
  }

  const target = await User.findById(participantId);
  if (!target) {
    return next(new AppError('User not found', 404));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, participantId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      createdBy: req.user._id,
    });
  }

  await conversation.populate('participants', PUBLIC_USER_FIELDS);
  const participant =
    conversation.participants.find((p) => p._id.toString() !== req.user._id.toString()) || null;

  return success(res, {
    data: { ...conversation.toObject(), participant },
    message: 'Conversation ready.',
  });
});

/**
 * Verify the requesting user is a participant of the conversation.
 * Calls next() with an error when not allowed and returns false.
 */
const ensureMembership = async (conversation, userId, next) => {
  if (!conversation) {
    next(new AppError('Conversation not found', 404));
    return false;
  }
  const isMember = conversation.participants.some(
    (p) => p.toString() === String(userId)
  );
  if (!isMember) {
    next(new AppError('You are not a participant of this conversation', 403));
    return false;
  }
  return true;
};

/**
 * @desc    Get messages in a conversation (with fromMe flags)
 * @route   GET /api/v1/chat/conversations/:id/messages
 * @access  Private (participants only)
 */
const getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!(await ensureMembership(conversation, req.user._id, next))) return;

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(200);

  const data = messages.map((m) => ({
    _id: m._id,
    content: m.content,
    fromMe: m.senderId.toString() === String(req.user._id),
    createdAt: m.createdAt,
  }));

  return success(res, { data, message: 'Messages retrieved successfully.' });
});

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/v1/chat/conversations/:id/messages
 * @access  Private (participants only)
 */
const sendMessage = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!(await ensureMembership(conversation, req.user._id, next))) return;

  const content = (req.body.content || '').trim();
  if (!content) {
    return next(new AppError('Message content is required', 400));
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.user._id,
    content,
  });

  conversation.lastMessage = content;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  return success(res, {
    data: {
      _id: message._id,
      content: message.content,
      fromMe: true,
      createdAt: message.createdAt,
    },
    message: 'Message sent successfully.',
    status: 201,
  });
});

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
};