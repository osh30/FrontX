const DiscussionQuestion = require('../models/DiscussionQuestion');
const DiscussionReply = require('../models/DiscussionReply');
const Notification = require('../models/Notification');
const { getSessionAccess } = require('../utils/sessionAccess');

const createQuestion = async (req, res) => {
  try {
    const { sessionId, sessionType, content, attachments } = req.body;
    const { session, role } = await getSessionAccess(sessionId, sessionType, req.user.id);
    if (!session || !role) {
      return res.status(403).json({ message: 'Not authorized to post in this session.' });
    }
    const question = await DiscussionQuestion.create({
      sessionId, sessionType, author: req.user.id, content, attachments: attachments || []
    });
    const populated = await question.populate('author', 'name profilePicture');

    // Notify alumni
    const alumniId = session.alumniId || session.alumni;
    if (alumniId && role === 'student') {
      await Notification.create({
        user: alumniId,
        title: 'New Question',
        message: `${populated.author?.name || 'A student'} asked: ${content.substring(0, 100)}`,
        type: 'system',
        relatedId: sessionId
      });
      if (req.app.get('io')) {
        req.app.get('io').to(alumniId.toString()).emit('new_notification');
        req.app.get('io').to(alumniId.toString()).emit('notification:new');
      }
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('question:created', populated);
    }
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { sessionId, sessionType } = req.params;
    const { session, role } = await getSessionAccess(sessionId, sessionType, req.user.id);
    if (!session || !role) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const questions = await DiscussionQuestion.find({ sessionId, sessionType })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await DiscussionQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    if (question.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own question.' });
    }
    const { content, attachments } = req.body;
    if (content !== undefined) question.content = content;
    if (attachments !== undefined) question.attachments = attachments;
    await question.save();
    const populated = await question.populate('author', 'name profilePicture');
    if (req.app.get('io')) {
      req.app.get('io').emit('question:updated', populated);
    }
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await DiscussionQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    if (question.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own question.' });
    }
    await DiscussionReply.deleteMany({ questionId: req.params.id });
    await DiscussionQuestion.findByIdAndDelete(req.params.id);
    if (req.app.get('io')) {
      req.app.get('io').emit('question:deleted', { id: req.params.id, sessionId: question.sessionId });
    }
    res.json({ message: 'Question deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleResolveQuestion = async (req, res) => {
  try {
    const question = await DiscussionQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    const { session, role } = await getSessionAccess(question.sessionId, question.sessionType, req.user.id);
    if (!session || role !== 'alumni') {
      return res.status(403).json({ message: 'Only the session creator can mark questions as resolved.' });
    }
    question.isResolved = !question.isResolved;
    await question.save();
    const populated = await question.populate('author', 'name profilePicture');
    if (req.app.get('io')) {
      req.app.get('io').emit('question:updated', populated);
    }
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createReply = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const question = await DiscussionQuestion.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    const { session, role } = await getSessionAccess(question.sessionId, question.sessionType, req.user.id);
    if (!session || !role) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const reply = await DiscussionReply.create({
      questionId: req.params.questionId, author: req.user.id, content, attachments: attachments || []
    });
    const populated = await reply.populate('author', 'name profilePicture');

    // Notify stakeholders
    if (role === 'alumni') {
      const notifyId = question.author;
      if (notifyId) {
        await Notification.create({
          user: notifyId,
          title: 'New Reply from Mentor',
          message: `${populated.author?.name || 'Alumni'} replied: ${content.substring(0, 100)}`,
          type: 'system',
          relatedId: question.sessionId
        });
        if (req.app.get('io')) {
          req.app.get('io').to(notifyId.toString()).emit('new_notification');
          req.app.get('io').to(notifyId.toString()).emit('notification:new');
        }
      }
    } else {
      const alumniId = session.alumniId || session.alumni;
      if (alumniId) {
        await Notification.create({
          user: alumniId,
          title: 'New Reply',
          message: `${populated.author?.name || 'A student'} replied: ${content.substring(0, 100)}`,
          type: 'system',
          relatedId: question.sessionId
        });
        if (req.app.get('io')) {
          req.app.get('io').to(alumniId.toString()).emit('new_notification');
          req.app.get('io').to(alumniId.toString()).emit('notification:new');
        }
      }
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('reply:created', { questionId: req.params.questionId, reply: populated });
    }
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReplies = async (req, res) => {
  try {
    const question = await DiscussionQuestion.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    const { session, role } = await getSessionAccess(question.sessionId, question.sessionType, req.user.id);
    if (!session || !role) return res.status(403).json({ message: 'Not authorized.' });
    const replies = await DiscussionReply.find({ questionId: req.params.questionId })
      .populate('author', 'name profilePicture')
      .sort({ isPinned: -1, createdAt: 1 });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReply = async (req, res) => {
  try {
    const reply = await DiscussionReply.findById(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found.' });
    if (reply.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reply.' });
    }
    const { content, attachments } = req.body;
    if (content !== undefined) reply.content = content;
    if (attachments !== undefined) reply.attachments = attachments;
    await reply.save();
    const populated = await reply.populate('author', 'name profilePicture');
    if (req.app.get('io')) {
      req.app.get('io').emit('reply:updated', { questionId: req.params.questionId, reply: populated });
    }
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReply = async (req, res) => {
  try {
    const reply = await DiscussionReply.findById(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found.' });
    if (reply.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reply.' });
    }
    await DiscussionReply.findByIdAndDelete(req.params.replyId);
    if (req.app.get('io')) {
      req.app.get('io').emit('reply:deleted', { questionId: req.params.questionId, replyId: req.params.replyId });
    }
    res.json({ message: 'Reply deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const togglePinReply = async (req, res) => {
  try {
    const reply = await DiscussionReply.findById(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found.' });
    const question = await DiscussionQuestion.findById(reply.questionId);
    const { session, role } = await getSessionAccess(question.sessionId, question.sessionType, req.user.id);
    if (!session || role !== 'alumni') {
      return res.status(403).json({ message: 'Only the session creator can pin replies.' });
    }
    reply.isPinned = !reply.isPinned;
    await reply.save();
    const populated = await reply.populate('author', 'name profilePicture');
    if (req.app.get('io')) {
      req.app.get('io').emit('reply:updated', { questionId: req.params.questionId, reply: populated });
    }
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuestion, getQuestions, updateQuestion, deleteQuestion, toggleResolveQuestion,
  createReply, getReplies, updateReply, deleteReply, togglePinReply
};
