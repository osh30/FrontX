const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createQuestion, getQuestions, updateQuestion, deleteQuestion, toggleResolveQuestion,
  createReply, getReplies, updateReply, deleteReply, togglePinReply
} = require('../controllers/discussionController');

// Questions
router.post('/questions', protect, createQuestion);
router.get('/:sessionId/:sessionType/questions', protect, getQuestions);
router.put('/questions/:id', protect, updateQuestion);
router.delete('/questions/:id', protect, deleteQuestion);
router.put('/questions/:id/resolve', protect, toggleResolveQuestion);

// Replies
router.post('/questions/:questionId/replies', protect, createReply);
router.get('/questions/:questionId/replies', protect, getReplies);
router.put('/questions/:questionId/replies/:replyId', protect, updateReply);
router.delete('/questions/:questionId/replies/:replyId', protect, deleteReply);
router.put('/questions/:questionId/replies/:replyId/pin', protect, togglePinReply);

module.exports = router;
