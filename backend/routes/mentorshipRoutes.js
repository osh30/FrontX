const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const emitToRoom = (req, room, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.to(room.toString()).emit(event, data);
  }
};

const createAuditLog = async (action, performedBy, studentId, alumniId, metadata = {}) => {
  return AuditLog.create({ action, performedBy, studentId, alumniId, metadata });
};

const createNotification = async (req, recipientUserId, senderUserId, title, message, relatedId = null) => {
  const Notification = require('../models/Notification');
  const notification = await Notification.create({
    user: recipientUserId,
    senderUserId,
    title,
    message,
    type: 'mentorship',
    relatedId,
    isRead: false
  });

  await createAuditLog('notification_sent', senderUserId || recipientUserId, null, null, {
    notificationId: notification._id,
    recipientUserId,
    title,
    message
  });

  const io = req.app.get('io');
  if (io) {
    io.to(recipientUserId.toString()).emit('notification:new', notification);
    io.to(recipientUserId.toString()).emit('new_notification', notification);
  }

  return notification;
};

// POST /api/mentorship/request - Send mentorship request
router.post('/request', protect, async (req, res) => {
  try {
    const { alumniId, requestType, message, time } = req.body;

    if (!alumniId || !requestType || !message) {
      return res.status(400).json({ message: "alumniId, requestType, and message are required." });
    }

    if (!isValidObjectId(alumniId)) {
      return res.status(400).json({ message: "Invalid alumni ID format." });
    }

    if (req.user.id === alumniId) {
      return res.status(400).json({ message: "You cannot send a mentorship request to yourself." });
    }

    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({ message: "Alumni not found." });
    }

    const existing = await MentorshipRequest.findOne({
      studentId: req.user.id,
      alumniId: alumniId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ message: "You have already sent a pending request to this alumni." });
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: "You are already connected with this alumni." });
      }
    }

    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const newReq = await MentorshipRequest.create({
      studentId: req.user.id,
      alumniId: alumniId,
      studentName: student.name || 'Unknown Student',
      studentDepartment: student.department || '',
      studentSession: student.session || '',
      requestType,
      message,
      time: time || 'Anytime'
    });

    await Activity.create({
      user: req.user.id,
      title: 'Sent mentorship request',
      type: 'mentorship',
      color: 'bg-blue-100 text-blue-600'
    });

    await createAuditLog('mentorship_request_sent', req.user.id, req.user.id, alumniId, {
      requestId: newReq._id,
      requestType,
      message
    });

    await createNotification(
      req, alumniId, req.user.id,
      'New Mentorship Request',
      `${student.name} sent you a ${requestType} request.`,
      newReq._id
    );

    emitToRoom(req, alumniId.toString(), 'mentorship:request', newReq);
    emitToRoom(req, alumniId.toString(), 'request_updated');

    res.status(201).json({ message: "Request sent successfully", request: newReq });
  } catch (error) {
    console.error('Mentorship request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/incoming - Alumni views incoming requests
router.get('/incoming', protect, async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ alumniId: req.user.id })
      .populate('studentId', 'name department profilePicture session bio interests')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/outgoing - Student views outgoing requests
router.get('/outgoing', protect, async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ studentId: req.user.id })
      .populate('alumniId', 'name department profilePicture bio')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/mentorship/request/:id/status - Accept or Decline request
router.put('/request/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'." });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID format." });
    }

    const request = await MentorshipRequest.findOne({ _id: req.params.id, alumniId: req.user.id });
    if (!request) {
      return res.status(404).json({ message: "Request not found or unauthorized." });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `This request has already been ${request.status}.` });
    }

    request.status = status;
    await request.save();

    const alumni = await User.findById(req.user.id);
    const student = await User.findById(request.studentId);

    if (status === 'accepted') {
      const globalActivity = await Activity.create({
        user: req.user.id,
        title: 'accepted a mentorship request',
        type: 'mentorship',
        color: 'bg-green-100 text-green-600',
        isGlobal: true
      });
      await globalActivity.populate('user', 'name profilePicture');
      const io = req.app.get('io');
      if (io) {
        io.emit('new_global_activity', globalActivity);
      }

      await Activity.create({
        user: request.studentId,
        title: 'Mentorship request accepted',
        type: 'mentorship',
        color: 'bg-green-100 text-green-600'
      });

      let existingConv = await Conversation.findOne({
        participants: { $all: [req.user.id, request.studentId] }
      });

      if (!existingConv) {
        existingConv = await Conversation.create({
          participants: [req.user.id, request.studentId],
          lastMessage: ''
        });

        await createAuditLog('conversation_auto_created', req.user.id, request.studentId, req.user.id, {
          conversationId: existingConv._id
        });

        emitToRoom(req, request.studentId.toString(), 'conversation:created', existingConv);
        emitToRoom(req, req.user.id.toString(), 'conversation:created', existingConv);
      }

      const autoMessageContent = `Hi! I have accepted your mentorship request. I look forward to connecting with you.`;
      const newMessage = await Message.create({
        sender: req.user.id,
        receiver: request.studentId,
        content: autoMessageContent,
      });

      existingConv.lastMessage = autoMessageContent;
      await existingConv.save();

      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + 7);

      await Deadline.create({
        user: req.user.id,
        title: 'Mentorship Session',
        date: sessionDate,
        type: 'mentorship'
      });
      await Deadline.create({
        user: request.studentId,
        title: 'Mentorship Session',
        date: sessionDate,
        type: 'mentorship'
      });

      await createAuditLog('mentorship_request_accepted', req.user.id, request.studentId, req.user.id, {
        requestId: request._id,
        conversationId: existingConv._id
      });

      await createNotification(
        req, request.studentId, req.user.id,
        'Mentorship Request Accepted',
        `Your mentorship request has been accepted by ${alumni.name || 'Ahmed Rahman'}.`,
        request._id
      );

      emitToRoom(req, request.studentId.toString(), 'mentorship:accepted', {
        request,
        conversation: existingConv,
        message: newMessage
      });
      emitToRoom(req, request.studentId.toString(), 'request_accepted', request);
      emitToRoom(req, request.studentId.toString(), 'message:new', newMessage);
      emitToRoom(req, request.studentId.toString(), 'new_message', newMessage);

      const { recalculateProgress } = require('../utils/progressCalculator');
      await recalculateProgress(request.studentId);
      const ioProgress = req.app.get('io');
      if (ioProgress) {
        ioProgress.emit('progress_updated', { userId: request.studentId });
      }
    } else {
      let conv = await Conversation.findOne({
        participants: { $all: [req.user.id, request.studentId] }
      });

      if (!conv) {
        conv = await Conversation.create({
          participants: [req.user.id, request.studentId],
          lastMessage: ''
        });

        await createAuditLog('conversation_auto_created', req.user.id, request.studentId, req.user.id, {
          conversationId: conv._id
        });

        emitToRoom(req, request.studentId.toString(), 'conversation:created', conv);
        emitToRoom(req, req.user.id.toString(), 'conversation:created', conv);
      }

      const autoMessageContent = `Hi. Unfortunately, I cannot accept your mentorship request at this time.`;
      const newMessage = await Message.create({
        sender: req.user.id,
        receiver: request.studentId,
        content: autoMessageContent,
      });

      conv.lastMessage = autoMessageContent;
      await conv.save();

      await createAuditLog('mentorship_request_declined', req.user.id, request.studentId, req.user.id, {
        requestId: request._id
      });

      await createNotification(
        req, request.studentId, req.user.id,
        'Mentorship Request Declined',
        `Your mentorship request has been declined by ${alumni.name || 'Ahmed Rahman'}.`,
        request._id
      );

      emitToRoom(req, request.studentId.toString(), 'mentorship:declined', {
        request,
        message: newMessage
      });
      emitToRoom(req, request.studentId.toString(), 'request_rejected', request);
      emitToRoom(req, request.studentId.toString(), 'message:new', newMessage);
      emitToRoom(req, request.studentId.toString(), 'new_message', newMessage);
    }

    emitToRoom(req, req.user.id.toString(), 'request_updated');
    const io = req.app.get('io');
    if (io) io.emit('request_updated');

    res.json({ message: `Request ${status} successfully`, request });
  } catch (error) {
    console.error('Mentorship status update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/connections/:userId - Accepted connections for any user
// Student → returns connected alumni (mentors). Alumni → returns connected students.
router.get('/connections/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) return res.status(400).json({ message: 'Invalid user id' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pickFields = 'name department profilePicture bio role session graduationYear';

    if (user.role === 'student') {
      const requests = await MentorshipRequest.find({ studentId: userId, status: 'accepted' })
        .populate('alumniId', pickFields)
        .sort({ createdAt: -1 });
      const unique = new Map();
      requests.forEach(r => {
        if (r.alumniId && !unique.has(r.alumniId._id.toString())) {
          unique.set(r.alumniId._id.toString(), r.alumniId);
        }
      });
      return res.json(Array.from(unique.values()));
    }

    if (user.role === 'alumni') {
      const requests = await MentorshipRequest.find({ alumniId: userId, status: 'accepted' })
        .populate('studentId', pickFields)
        .sort({ createdAt: -1 });
      const unique = new Map();
      requests.forEach(r => {
        if (r.studentId && !unique.has(r.studentId._id.toString())) {
          unique.set(r.studentId._id.toString(), r.studentId);
        }
      });
      return res.json(Array.from(unique.values()));
    }

    res.json([]);
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
