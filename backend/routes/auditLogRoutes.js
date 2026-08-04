const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// GET /api/audit-logs - Get all audit logs (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'alumni') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { action, studentId, alumniId, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (studentId) filter.studentId = studentId;
    if (alumniId) filter.alumniId = alumniId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(filter)
      .populate('studentId', 'name email department')
      .populate('alumniId', 'name email department')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Audit log fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit-logs/stats - Get audit log statistics (admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'alumni') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalLogs = await AuditLog.countDocuments();

    res.json({ stats, totalLogs });
  } catch (error) {
    console.error('Audit log stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
