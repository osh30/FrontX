const PlatformAnnouncement = require('../models/PlatformAnnouncement');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getAdminAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, priority, status, pinned } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (pinned === 'true') query.isPinned = true;

    const now = new Date();
    if (status === 'Active') {
      query.isActive = true;
      query.publishDate = { $lte: now };
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
      });
    } else if (status === 'Scheduled') {
      query.publishDate = { $gt: now };
    } else if (status === 'Expired') {
      query.expiryDate = { $lte: now };
      query.expiryDate = { $ne: null };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [announcements, total] = await Promise.all([
      PlatformAnnouncement.find(query)
        .populate('postedBy', 'name email')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      PlatformAnnouncement.countDocuments(query),
    ]);

    res.json({
      announcements,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, category, priority, description, publishDate, expiryDate, attachment, isPinned } = req.body;
    const announcement = await PlatformAnnouncement.create({
      title,
      category,
      priority,
      description,
      publishDate: publishDate || new Date(),
      expiryDate: expiryDate || null,
      attachment: attachment || '',
      isPinned: isPinned || false,
      postedBy: req.user.id,
    });

    const populated = await announcement.populate('postedBy', 'name email');

    // Send notifications to all students and alumni
    const shouldNotify = !publishDate || new Date(publishDate) <= new Date();
    if (shouldNotify) {
      const users = await User.find({ role: { $in: ['student', 'alumni'] } }).select('_id').lean();
      const notifications = users.map((u) => ({
        user: u._id,
        title: 'New Announcement',
        message: title,
        type: 'system',
        relatedId: announcement._id,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      // Real-time via Socket.IO
      if (req.app.get('io')) {
        for (const u of users) {
          req.app.get('io').to(u._id.toString()).emit('new_notification');
          req.app.get('io').to(u._id.toString()).emit('notification:new');
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

const updateAnnouncement = async (req, res) => {
  try {
    const allowed = ['title', 'category', 'priority', 'description', 'publishDate', 'expiryDate', 'attachment', 'isPinned', 'isActive'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const announcement = await PlatformAnnouncement.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    const populated = await announcement.populate('postedBy', 'name email');

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
    const announcement = await PlatformAnnouncement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (req.app.get('io')) {
      req.app.get('io').emit('announcement:deleted', { id: req.params.id });
    }

    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const togglePin = async (req, res) => {
  try {
    const announcement = await PlatformAnnouncement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();
    const populated = await announcement.populate('postedBy', 'name email');

    if (req.app.get('io')) {
      req.app.get('io').emit('announcement:updated', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public endpoint for students/alumni
const getPublicAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await PlatformAnnouncement.find({
      isActive: true,
      publishDate: { $lte: now },
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
    })
      .populate('postedBy', 'name')
      .sort({ isPinned: -1, publishDate: -1 })
      .lean();

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
  getPublicAnnouncements,
};
