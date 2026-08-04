const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const { getSessionAccess } = require('../utils/sessionAccess');

const createAnnouncement = async (req, res) => {
  try {
    const { sessionId, sessionType, title, description, attachments, isPinned } = req.body;
    const { session, role } = await getSessionAccess(sessionId, sessionType, req.user.id);
    if (!session || role !== 'alumni') {
      return res.status(403).json({ message: 'Only the session creator can create announcements.' });
    }

    const announcement = await Announcement.create({
      sessionId, sessionType, title, description, attachments: attachments || [], postedBy: req.user.id, isPinned: isPinned || false
    });
    const populated = await announcement.populate('postedBy', 'name profilePicture');

    // Notify all students
    const studentIds = sessionType === 'group' ? session.selectedStudents : [session.student];
    for (const sid of studentIds) {
      if (sid) {
        await Notification.create({
          user: sid,
          title: 'New Announcement',
          message: `${title}`,
          type: 'system',
          relatedId: sessionId
        });
        if (req.app.get('io')) {
          req.app.get('io').to(sid.toString()).emit('new_notification');
          req.app.get('io').to(sid.toString()).emit('notification:new');
        }
      }
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('announcement:created', populated);
    }
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { sessionId, sessionType } = req.params;
    const { session, role } = await getSessionAccess(sessionId, sessionType, req.user.id);
    if (!session || !role) {
      return res.status(403).json({ message: 'Not authorized to view these announcements.' });
    }
    const announcements = await Announcement.find({ sessionId, sessionType })
      .populate('postedBy', 'name profilePicture')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });
    const { session, role } = await getSessionAccess(announcement.sessionId, announcement.sessionType, req.user.id);
    if (!session || role !== 'alumni') {
      return res.status(403).json({ message: 'Only the session creator can edit announcements.' });
    }
    const { title, description, attachments } = req.body;
    if (title !== undefined) announcement.title = title;
    if (description !== undefined) announcement.description = description;
    if (attachments !== undefined) announcement.attachments = attachments;
    await announcement.save();
    const populated = await announcement.populate('postedBy', 'name profilePicture');

    // Notify students about update
    const studentIds = announcement.sessionType === 'group' ? session.selectedStudents : [session.student];
    for (const sid of studentIds) {
      if (sid) {
        await Notification.create({
          user: sid,
          title: 'Announcement Updated',
          message: `${announcement.title}`,
          type: 'system',
          relatedId: announcement.sessionId
        });
        if (req.app.get('io')) {
          req.app.get('io').to(sid.toString()).emit('new_notification');
          req.app.get('io').to(sid.toString()).emit('notification:new');
        }
      }
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('announcement:updated', populated);
    }
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });
    const { session, role } = await getSessionAccess(announcement.sessionId, announcement.sessionType, req.user.id);
    if (!session || role !== 'alumni') {
      return res.status(403).json({ message: 'Only the session creator can delete announcements.' });
    }
    await Announcement.findByIdAndDelete(req.params.id);
    if (req.app.get('io')) {
      req.app.get('io').emit('announcement:deleted', { id: req.params.id, sessionId: announcement.sessionId });
    }
    res.json({ message: 'Announcement deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const togglePinAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found.' });
    const { session, role } = await getSessionAccess(announcement.sessionId, announcement.sessionType, req.user.id);
    if (!session || role !== 'alumni') {
      return res.status(403).json({ message: 'Only the session creator can pin announcements.' });
    }
    announcement.isPinned = !announcement.isPinned;
    await announcement.save();
    const populated = await announcement.populate('postedBy', 'name profilePicture');
    if (req.app.get('io')) {
      req.app.get('io').emit('announcement:updated', populated);
    }
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, togglePinAnnouncement };
