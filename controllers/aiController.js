const axios = require('axios');
const { success, error } = require('../utils/apiResponse');
const { logInfo, logError } = require('../utils/logger');

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const API_KEY = process.env.OPENAI_API_KEY || '';

const chat = asyncHandler(async (req, res) => {
  const { message, context } = req.body;
  
  if (!message) {
    return error(res, { status: 400, message: 'Message is required' });
  }
  
  logInfo('AI chat request from user ' + req.user.id);
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful UniSphere AI assistant.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + API_KEY
        }
      }
    );
    
    const assistantMessage = response.data.choices[0].message.content;
    
    logInfo('AI chat response generated');
    
    return success(res, { message: assistantMessage });
  } catch (err) {
    logError('AI chat error: ' + err.message);
    return error(res, { status: 500, message: 'AI service temporarily unavailable' });
  }
});

const getConversations = asyncHandler(async (req, res) => {
  // In a real implementation, this would fetch from DB
  const conversations = [{ id: '1', title: 'Course Questions' }];
  
  return success(res, { conversations });
});

const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // In a real implementation, this would fetch from DB
  const conversation = { id, messages: [], title: 'Conversation' };
  
  return success(res, { conversation });
});

const lessonExplain = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { question } = req.body;
  
  if (!question) {
    return error(res, { status: 400, message: 'Question is required' });
  }
  
  logInfo('Lesson explanation request for lesson ' + lessonId);
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful course assistant.' },
          { role: 'user', content: question }
        ],
        temperature: 0.5,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + API_KEY
        }
      }
    );
    
    const explanation = response.data.choices[0].message.content;
    
    return success(res, { explanation });
  } catch (err) {
    logError('Lesson explanation error: ' + err.message);
    return error(res, { status: 500, message: 'AI service temporarily unavailable' });
  }
});

const quizGenerate = asyncHandler(async (req, res) => {
  const { lessonId, topic, count } = req.body;
  
  if (!lessonId || !topic) {
    return error(res, { status: 400, message: 'Lesson ID and topic are required' });
  }
  
  const questionCount = count || 5;
  
  logInfo('Quiz generation request for lesson ' + lessonId + ', topic: ' + topic);
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a course creator. Generate multiple choice questions about ' + topic + '.' },
          { role: 'user', content: 'Generate quiz questions' }
        ],
        temperature: 0.5,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + API_KEY
        }
      }
    );
    
    const quizQuestions = response.data.choices[0].message.content;
    
    return success(res, { quizQuestions });
  } catch (err) {
    logError('Quiz generation error: ' + err.message);
    return error(res, { status: 500, message: 'AI service temporarily unavailable' });
  }
});

const challengeHint = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  
  logInfo('Challenge hint request for challenge ' + challengeId);
  
  try {
    const hint = 'Remember to check the problem statement constraints.';
    
    return success(res, { hint });
  } catch (err) {
    logError('Challenge hint error: ' + err.message);
    return error(res, { status: 500, message: 'AI service temporarily unavailable' });
  }
});

const codeExplain = asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return error(res, { status: 400, message: 'Code is required' });
  }
  
  logInfo('Code explanation request');
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a programming tutor.' },
          { role: 'user', content: code }
        ],
        temperature: 0.5,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + API_KEY
        }
      }
    );
    
    const explanation = response.data.choices[0].message.content;
    
    return success(res, { explanation });
  } catch (err) {
    logError('Code explanation error: ' + err.message);
    return error(res, { status: 500, message: 'AI service temporarily unavailable' });
  }
});

const getUsage = asyncHandler(async (req, res) => {
  const usage = { totalRequests: 0, totalTokens: 0, cost: 0 };
  
  return success(res, { usage });
});

module.exports = { chat, getConversations, getConversation, lessonExplain, quizGenerate, challengeHint, codeExplain, getUsage };
