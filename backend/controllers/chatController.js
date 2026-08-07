const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const PinnedChat = require('../models/PinnedChat');
const StarredMessage = require('../models/StarredMessage');
const PrivateNote = require('../models/PrivateNote');
const ConversationLabel = require('../models/ConversationLabel');
const MentorshipGoal = require('../models/MentorshipGoal');
const FollowUpReminder = require('../models/FollowUpReminder');
const Notification = require('../models/Notification');
const MentorshipRequest = require('../models/MentorshipRequest');
const CollaborationApplication = require('../models/CollaborationApplication');

// Build the conversation preview for the OTHER participant (never the logged-in user)
function buildOtherParticipant(reqUser, participants) {
  const myId = String(reqUser);
  const otherUser = (participants || []).find(p => String(p._id) !== myId) || (participants || [])[0] || null;
  if (!otherUser) return null;
  return {
    _id: otherUser._id,
    fullName: otherUser.name,
    profilePhoto: otherUser.profilePicture,
    department: otherUser.department,
    role: otherUser.role,
    session: otherUser.session,
    graduationYear: otherUser.graduationYear
  };
}

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name role profilePicture department session graduationYear')
      .sort({ lastMessageTime: -1, updatedAt: -1 });

    const pinnedChats = await PinnedChat.find({ user: req.user.id }).lean();
    const pinnedIds = pinnedChats.map(p => p.conversation.toString());

    const enriched = await Promise.all(conversations.map(async (conv) => {
      const obj = conv.toObject();
      const otherParticipant = buildOtherParticipant(req.user.id, obj.participants);
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        receiver: req.user.id,
        isRead: false,
        isDeletedForReceiver: false,
        isDeletedForEveryone: false
      });
      const isPinned = pinnedIds.includes(conv._id.toString());
      const label = await ConversationLabel.findOne({
        user: req.user.id,
        conversation: conv._id
      }).lean();
      return { ...obj, other: otherParticipant, otherParticipant, unreadCount, isPinned, label: label?.label || '' };
    }));

    enriched.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chat/conversations (auto-create)
exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    if (req.user.id === participantId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }
    let conv = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] }
    });
    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user.id, participantId]
      });
    }
    const populated = await conv.populate('participants', 'name role profilePicture department session graduationYear');
    const obj = populated.toObject();
    const otherParticipant = buildOtherParticipant(req.user.id, obj.participants);
    res.json({ ...obj, other: otherParticipant, otherParticipant });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chat/conversations/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await Conversation.findById(id);
    if (!conv || !conv.participants.map(p => p.toString()).includes(String(req.user.id))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const otherParticipant = conv.participants.find(p => p.toString() !== String(req.user.id));

    await Message.updateMany(
      { conversation: id, receiver: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const messages = await Message.find({
      conversation: id,
      isDeletedForEveryone: false
    }).populate('sender', 'name profilePicture').sort({ createdAt: 1 });

    const starred = await StarredMessage.find({
      user: req.user.id,
      conversation: id
    }).lean();
    const starredIds = starred.map(s => s.message.toString());

    const label = await ConversationLabel.findOne({
      user: req.user.id,
      conversation: id
    }).lean();

    const notes = await PrivateNote.find({
      alumniId: req.user.id,
      conversationId: id
    }).sort({ createdAt: -1 }).lean();

    const goals = await MentorshipGoal.find({
      conversationId: id
    }).sort({ createdAt: -1 }).lean();

    const reminders = await FollowUpReminder.find({
      conversationId: id
    }).sort({ createdAt: -1 }).lean();

    const io = req.app.get('io');
    if (io) {
      io.to(otherParticipant.toString()).emit('message:seen', {
        conversationId: id,
        userId: req.user.id,
        seenAt: new Date()
      });
    }

    const enriched = messages.map(m => ({
      ...m.toObject(),
      isStarred: starredIds.includes(m._id.toString())
    }));

    res.json({
      messages: enriched,
      label: label?.label || '',
      notes,
      goals,
      reminders
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chat/conversations/:id/messages
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType, fileUrl, fileName, fileSize } = req.body;

    const conv = await Conversation.findById(id);
    if (!conv || !conv.participants.map(p => p.toString()).includes(String(req.user.id))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const receiver = conv.participants.find(p => p.toString() !== String(req.user.id));

    const msg = await Message.create({
      conversation: id,
      sender: req.user.id,
      receiver,
      content: content || '',
      messageType: messageType || 'text',
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null
    });

    conv.lastMessage = content || fileName || (messageType === 'image' ? '📷 Image' : '📎 File');
    conv.lastMessageSender = req.user.id;
    conv.lastMessageTime = new Date();
    conv.lastMessageType = messageType || 'text';
    await conv.save();

    const populated = await msg.populate('sender', 'name profilePicture');

    const io = req.app.get('io');
    if (io) {
      io.to(receiver.toString()).emit('message:receive', populated.toObject());
      io.to(receiver.toString()).emit('conversation:update', { conversationId: id });

      await Notification.create({
        user: receiver,
        senderUserId: req.user.id,
        title: 'New Message',
        message: `${req.user.name || 'Someone'} sent you a message`,
        type: 'message',
        relatedId: msg._id
      });
      io.to(receiver.toString()).emit('notification:new', {
        title: 'New Message',
        message: `${req.user.name || 'Someone'} sent you a message`,
        type: 'message'
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chat/messages/:id
exports.editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    msg.editHistory.push({ content: msg.content, editedAt: new Date() });
    msg.content = content;
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    const io = req.app.get('io');
    if (io) {
      io.to(msg.receiver.toString()).emit('message:edited', msg.toObject());
      io.to(msg.sender.toString()).emit('message:edited', msg.toObject());
    }

    res.json(msg);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/chat/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const { deleteFor } = req.body; // 'me' or 'everyone'
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.sender.toString() !== req.user.id && deleteFor === 'everyone') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (deleteFor === 'everyone') {
      msg.isDeletedForEveryone = true;
      msg.deletedForEveryoneAt = new Date();
    } else {
      if (msg.sender.toString() === req.user.id) {
        msg.isDeletedForSender = true;
      } else {
        msg.isDeletedForReceiver = true;
      }
    }
    await msg.save();

    const io = req.app.get('io');
    if (io) {
      const other = msg.sender.toString() === req.user.id ? msg.receiver : msg.sender;
      const data = { messageId: msg._id, conversationId: msg.conversation, deleteFor };
      io.to(other.toString()).emit('message:deleted', data);
      io.to(req.user.id).emit('message:deleted', data);
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chat/messages/:id/reaction
exports.toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const existing = msg.reactions.find(
      r => r.emoji === emoji && r.userId.toString() === req.user.id
    );
    if (existing) {
      msg.reactions.pull({ _id: existing._id });
    } else {
      msg.reactions.push({ emoji, userId: req.user.id });
    }
    await msg.save();

    const io = req.app.get('io');
    if (io) {
      const otherId = msg.sender.toString() === req.user.id ? msg.receiver : msg.sender;
      io.to(otherId.toString()).emit('message:reaction', msg.toObject());
      io.to(req.user.id).emit('message:reaction', msg.toObject());
    }

    res.json(msg);
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chat/conversations/:id/pin
exports.togglePin = async (req, res) => {
  try {
    const existing = await PinnedChat.findOne({
      user: req.user.id,
      conversation: req.params.id
    });
    if (existing) {
      await PinnedChat.findByIdAndDelete(existing._id);
      res.json({ pinned: false });
    } else {
      await PinnedChat.create({ user: req.user.id, conversation: req.params.id });
      res.json({ pinned: true });
    }
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chat/starred
exports.getStarredMessages = async (req, res) => {
  try {
    const starred = await StarredMessage.find({ user: req.user.id })
      .populate({
        path: 'message',
        populate: { path: 'sender', select: 'name profilePicture' }
      })
      .populate('conversation', 'participants')
      .sort({ createdAt: -1 });

    res.json(starred.filter(s => s.message && !s.message.isDeletedForEveryone));
  } catch (error) {
    console.error('Error getting starred messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chat/messages/:id/star
exports.toggleStar = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const existing = await StarredMessage.findOne({
      user: req.user.id,
      message: req.params.id
    });
    if (existing) {
      await StarredMessage.findByIdAndDelete(existing._id);
      res.json({ starred: false });
    } else {
      await StarredMessage.create({
        user: req.user.id,
        message: req.params.id,
        conversation: msg.conversation
      });
      res.json({ starred: true });
    }
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chat/conversations/:id/files
exports.getSharedFiles = async (req, res) => {
  try {
    const files = await Message.find({
      conversation: req.params.id,
      messageType: { $in: ['image', 'file'] },
      isDeletedForEveryone: false,
      fileUrl: { $ne: null }
    })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    console.error('Error getting shared files:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chat/conversations/:id/label
exports.setLabel = async (req, res) => {
  try {
    const { label } = req.body;
    const existing = await ConversationLabel.findOne({
      user: req.user.id,
      conversation: req.params.id
    });
    if (label) {
      if (existing) {
        existing.label = label;
        await existing.save();
      } else {
        await ConversationLabel.create({
          user: req.user.id,
          conversation: req.params.id,
          label
        });
      }
    } else {
      if (existing) await ConversationLabel.findByIdAndDelete(existing._id);
    }
    res.json({ label: label || '' });
  } catch (error) {
    console.error('Error setting label:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chat/conversations/:id/notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await PrivateNote.find({
      alumniId: req.user.id,
      conversationId: req.params.id
    }).sort({ createdAt: -1 }).lean();
    res.json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chat/conversations/:id/notes
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    const studentId = conv.participants.find(p => p.toString() !== String(req.user.id));
    const note = await PrivateNote.create({
      alumniId: req.user.id,
      studentId,
      conversationId: req.params.id,
      title: title || '',
      content: content || ''
    });
    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('note:created', note.toObject());
    }
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chat/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await PrivateNote.findOne({ _id: req.params.id, alumniId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();
    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('note:updated', note.toObject());
    }
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/chat/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await PrivateNote.findOne({ _id: req.params.id, alumniId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    await PrivateNote.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('note:deleted', { noteId: req.params.id, conversationId: note.conversationId });
    }
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GOALS ──────────────────────────────────────

// GET /api/chat/conversations/:id/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await MentorshipGoal.find({ conversationId: req.params.id })
      .sort({ createdAt: -1 }).lean();
    res.json(goals);
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chat/conversations/:id/goals
exports.createGoal = async (req, res) => {
  try {
    const { title, progress, deadline } = req.body;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    const studentId = conv.participants.find(p => p.toString() !== String(req.user.id));
    const goal = await MentorshipGoal.create({
      alumniId: req.user.id,
      studentId,
      conversationId: req.params.id,
      title,
      progress: progress || 0,
      deadline: deadline || null
    });
    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('goal:created', goal.toObject());
      io.to(studentId.toString()).emit('goal:created', goal.toObject());
    }
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/chat/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const { title, progress, deadline, status } = req.body;
    const goal = await MentorshipGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.alumniId.toString() !== req.user.id) {
      if (req.user.role !== 'student') return res.status(403).json({ message: 'Unauthorized' });
    }
    if (title !== undefined) goal.title = title;
    if (progress !== undefined) goal.progress = progress;
    if (deadline !== undefined) goal.deadline = deadline;
    if (status !== undefined) goal.status = status;
    await goal.save();
    const io = req.app.get('io');
    if (io) {
      io.to(goal.alumniId.toString()).emit('goal:updated', goal.toObject());
      io.to(goal.studentId.toString()).emit('goal:updated', goal.toObject());
    }
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/chat/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await MentorshipGoal.findOne({ _id: req.params.id, alumniId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    await MentorshipGoal.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    if (io) {
      const data = { goalId: req.params.id, conversationId: goal.conversationId };
      io.to(goal.alumniId.toString()).emit('goal:deleted', data);
      io.to(goal.studentId.toString()).emit('goal:deleted', data);
    }
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── REMINDERS ──────────────────────────────────

// GET /api/chat/conversations/:id/reminders
exports.getReminders = async (req, res) => {
  try {
    const reminders = await FollowUpReminder.find({ conversationId: req.params.id })
      .sort({ createdAt: -1 }).lean();
    res.json(reminders);
  } catch (error) {
    console.error('Error getting reminders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/chat/conversations/:id/reminders
exports.createReminder = async (req, res) => {
  try {
    const { title, reminderDate, reminderTime } = req.body;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    const studentId = conv.participants.find(p => p.toString() !== String(req.user.id));
    const reminder = await FollowUpReminder.create({
      alumniId: req.user.id,
      studentId,
      conversationId: req.params.id,
      title,
      reminderDate: reminderDate || '',
      reminderTime: reminderTime || '12:00'
    });
    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('reminder:created', reminder.toObject());
    }
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/chat/reminders/:id
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await FollowUpReminder.findOne({ _id: req.params.id, alumniId: req.user.id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    await FollowUpReminder.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id).emit('reminder:deleted', { reminderId: req.params.id, conversationId: reminder.conversationId });
    }
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chat/labels
exports.getLabels = async (req, res) => {
  try {
    const labels = await ConversationLabel.find({ user: req.user.id }).lean();
    const uniqueLabels = [...new Set(labels.map(l => l.label))];
    res.json(uniqueLabels);
  } catch (error) {
    console.error('Error getting labels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/chat/search
exports.searchConversations = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const conversations = await Conversation.find({
      participants: req.user.id
    }).populate('participants', 'name department profilePicture session graduationYear');

    const results = [];
    for (const conv of conversations) {
      const other = conv.participants.find(p => String(p._id) !== String(req.user.id));
      if (!other) continue;
      const otherParticipant = buildOtherParticipant(req.user.id, conv.participants);
      const nameMatch = other.name?.toLowerCase().includes(q.toLowerCase());
      const deptMatch = other.department?.toLowerCase().includes(q.toLowerCase());
      const lastMsgMatch = conv.lastMessage?.toLowerCase().includes(q.toLowerCase());
      if (nameMatch || deptMatch || lastMsgMatch) {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: req.user.id,
          isRead: false,
          isDeletedForReceiver: false,
          isDeletedForEveryone: false
        });
        results.push({ ...conv.toObject(), otherParticipant, unreadCount });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error searching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
