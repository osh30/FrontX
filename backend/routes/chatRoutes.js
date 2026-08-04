const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

router.get('/conversations', protect, chatController.getConversations);
router.post('/conversations', protect, chatController.createConversation);
router.get('/conversations/:id/messages', protect, chatController.getMessages);
router.post('/conversations/:id/messages', protect, chatController.sendMessage);
router.put('/conversations/:id/pin', protect, chatController.togglePin);
router.put('/conversations/:id/label', protect, chatController.setLabel);
router.get('/conversations/:id/notes', protect, chatController.getNotes);
router.post('/conversations/:id/notes', protect, chatController.createNote);
router.put('/notes/:id', protect, chatController.updateNote);
router.delete('/notes/:id', protect, chatController.deleteNote);
router.get('/conversations/:id/files', protect, chatController.getSharedFiles);
router.get('/conversations/:id/goals', protect, chatController.getGoals);
router.post('/conversations/:id/goals', protect, chatController.createGoal);
router.put('/goals/:id', protect, chatController.updateGoal);
router.delete('/goals/:id', protect, chatController.deleteGoal);
router.get('/conversations/:id/reminders', protect, chatController.getReminders);
router.post('/conversations/:id/reminders', protect, chatController.createReminder);
router.delete('/reminders/:id', protect, chatController.deleteReminder);
router.put('/messages/:id', protect, chatController.editMessage);
router.delete('/messages/:id', protect, chatController.deleteMessage);
router.put('/messages/:id/reaction', protect, chatController.toggleReaction);
router.put('/messages/:id/star', protect, chatController.toggleStar);
router.get('/starred', protect, chatController.getStarredMessages);
router.get('/labels', protect, chatController.getLabels);
router.get('/search', protect, chatController.searchConversations);

// Legacy contacts endpoint for backward compatibility
router.get('/contacts', protect, async (req, res) => {
  const MentorshipRequest = require('../models/MentorshipRequest');
  const CollaborationApplication = require('../models/CollaborationApplication');
  const Message = require('../models/Message');
  const Conversation = require('../models/Conversation');

  try {
    const mentorshipReqs = await MentorshipRequest.find({
      $or: [{ studentId: req.user.id }, { alumniId: req.user.id }],
      status: 'accepted'
    }).populate('studentId', 'name role profilePicture department')
      .populate('alumniId', 'name role profilePicture department');

    const collabReqs = await CollaborationApplication.find({
      $or: [{ student: req.user.id }, { alumni: req.user.id }],
      status: 'accepted'
    }).populate('student', 'name role profilePicture department')
      .populate('alumni', 'name role profilePicture department');

    const contactsMap = new Map();

    for (const r of mentorshipReqs) {
      const contact = r.studentId._id.toString() === req.user.id ? r.alumniId : r.studentId;
      if (!contact) continue;
      const conv = await Conversation.findOne({
        participants: { $all: [req.user.id, contact._id] }
      });
      const lastMsg = conv ? await Message.findOne({ conversation: conv._id }).sort({ createdAt: -1 }) : null;
      const unread = conv ? await Message.countDocuments({ conversation: conv._id, receiver: req.user.id, isRead: false }) : 0;
      contactsMap.set(contact._id.toString(), {
        _id: contact._id, name: contact.name, role: contact.role,
        profilePicture: contact.profilePicture, department: contact.department,
        lastMsg: lastMsg?.content || 'Start chatting', time: lastMsg?.createdAt || r.createdAt,
        unread, status: 'offline'
      });
    }

    for (const r of collabReqs) {
      const contact = r.student._id.toString() === req.user.id ? r.alumni : r.student;
      if (!contact) continue;
      const conv = await Conversation.findOne({
        participants: { $all: [req.user.id, contact._id] }
      });
      const lastMsg = conv ? await Message.findOne({ conversation: conv._id }).sort({ createdAt: -1 }) : null;
      const unread = conv ? await Message.countDocuments({ conversation: conv._id, receiver: req.user.id, isRead: false }) : 0;
      if (!contactsMap.has(contact._id.toString())) {
        contactsMap.set(contact._id.toString(), {
          _id: contact._id, name: contact.name, role: contact.role,
          profilePicture: contact.profilePicture, department: contact.department,
          lastMsg: lastMsg?.content || 'Start chatting', time: lastMsg?.createdAt || r.createdAt,
          unread, status: 'offline'
        });
      }
    }

    res.json(Array.from(contactsMap.values()));
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy send message endpoint
router.post('/:contactId/messages', protect, async (req, res) => {
  try {
    const Message = require('../models/Message');
    const Conversation = require('../models/Conversation');
    const User = require('../models/User');
    const { content } = req.body;

    let conv = await Conversation.findOne({
      participants: { $all: [req.user.id, req.params.contactId] }
    });
    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user.id, req.params.contactId]
      });
    }

    const msg = await Message.create({
      conversation: conv._id,
      sender: req.user.id,
      receiver: req.params.contactId,
      content: content || '',
      messageType: 'text'
    });

    conv.lastMessage = content;
    conv.lastMessageSender = req.user.id;
    conv.lastMessageTime = new Date();
    await conv.save();

    const populated = await msg.populate('sender', 'name profilePicture');

    const io = req.app.get('io');
    if (io) {
      io.to(req.params.contactId).emit('receive_message', populated.toObject());
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy get messages endpoint
router.get('/:contactId/messages', protect, async (req, res) => {
  try {
    const Message = require('../models/Message');
    const Conversation = require('../models/Conversation');

    const conv = await Conversation.findOne({
      participants: { $all: [req.user.id, req.params.contactId] }
    });

    if (!conv) return res.json([]);

    await Message.updateMany(
      { conversation: conv._id, receiver: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const messages = await Message.find({
      conversation: conv._id,
      isDeletedForEveryone: false
    }).populate('sender', 'name profilePicture').sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
