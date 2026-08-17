const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const MentorshipRequest = require('../models/MentorshipRequest');
const Session = require('../models/Session');
const MentorshipSession = require('../models/MentorshipSession');
const Resource = require('../models/Resource');
const AdminResource = require('../models/AdminResource');
const analyticsController = require('../controllers/analyticsController');

const User = require('../models/User');

// GET /api/alumni/public - Unauthenticated public endpoint for landing page
router.get('/public', async (req, res) => {
  try {
    const alumniList = await User.find({ role: 'alumni', isActive: { $ne: false }, status: { $ne: 'rejected' } })
      .select('name profilePicture avatar currentJob jobTitle designation company companyName workplace department bio')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const alumni = alumniList.map(a => {
      const job = a.currentJob || a.jobTitle || a.designation || '';
      const company = a.company || a.companyName || a.workplace || '';
      
      let workTitle = '';
      if (job && company) {
        workTitle = `${job} at ${company}`;
      } else if (job) {
        workTitle = job;
      } else if (company) {
        workTitle = company;
      } else if (a.department) {
        workTitle = `Alumni • ${a.department}`;
      } else {
        workTitle = 'Alumni Mentor';
      }

      return {
        _id: a._id,
        id: a._id,
        name: a.name,
        profilePicture: a.profilePicture || a.avatar || '',
        workTitle,
        department: a.department || 'Educational Technology & Engineering'
      };
    });

    res.json({ success: true, alumni });
  } catch (error) {
    console.error('Public alumni endpoint error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public alumni' });
  }
});

// GET /api/alumni/analytics/dashboard
router.get('/analytics/dashboard', protect, analyticsController.getAlumniAnalytics);
router.get('/stats', protect, async (req, res) => {
  try {
    const alumniId = req.user.id;
    const now = new Date();

    // Total Students Mentored (unique students whose requests are accepted)
    const uniqueStudents = await MentorshipRequest.distinct('studentId', { alumniId, status: 'accepted' });
    const totalStudentsMentored = uniqueStudents.length;

    // Active Mentorships (all accepted requests)
    const activeMentorships = await MentorshipRequest.countDocuments({ alumniId, status: 'accepted' });

    // Upcoming Sessions (1-on-1 + group mentorship) whose scheduled date+time is still in the future
    const upcomingSoloSessions = await Session.find(
      { alumni: alumniId, status: { $nin: ['Cancelled', 'Completed'] } },
      { date: 1, time: 1 }
    ).lean();
    const upcomingGroupSessions = await MentorshipSession.find(
      { alumniId, status: { $nin: ['Cancelled', 'Completed'] } },
      { sessionDate: 1, sessionTime: 1 }
    ).lean();

    const isUpcoming = (date, time) => {
      if (!date) return false;
      const scheduled = new Date(date);
      const [hours, minutes] = String(time || '').split(':');
      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      if (!Number.isNaN(h)) {
        scheduled.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
      }
      return scheduled.getTime() > now.getTime();
    };

    const upcomingSessions =
      upcomingSoloSessions.filter(s => isUpcoming(s.date, s.time)).length +
      upcomingGroupSessions.filter(g => isUpcoming(g.sessionDate, g.sessionTime)).length;

    // Resources Shared (AdminResource hub uploads + legacy Resource model uploads belonging to this alumni)
    const [adminResourcesShared, legacyResourcesShared] = await Promise.all([
      AdminResource.countDocuments({ uploadedBy: alumniId, uploadedByRole: 'alumni' }),
      Resource.countDocuments({ alumniId })
    ]);
    const resourcesShared = adminResourcesShared + legacyResourcesShared;

    res.json({
      totalStudentsMentored,
      activeMentorships,
      upcomingSessions,
      resourcesShared
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
