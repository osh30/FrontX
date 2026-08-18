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

const { effectiveWindow, getMeetingPhase, deriveSessionStatus } = require('../meetings/lib/meetingTime');

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

    // Upcoming Sessions (1-on-1 + group mentorship) whose phase is strictly 'upcoming' or 'active'
    const soloSessions = await Session.find(
      { alumni: alumniId, status: { $nin: ['Cancelled', 'Completed', 'Past Session'] } }
    ).lean();
    const groupSessions = await MentorshipSession.find(
      { alumniId, status: { $nin: ['Cancelled', 'Completed', 'Past Session'] } }
    ).lean();

    const isSessionUpcoming = (sessionDoc) => {
      const derived = deriveSessionStatus(sessionDoc, now);
      if (derived === 'Completed' || derived === 'Past Session' || derived === 'Cancelled') {
        return false;
      }
      const window = effectiveWindow(sessionDoc);
      if (!window || !window.start) return false;
      const phase = getMeetingPhase(window, now).phase;
      return phase === 'upcoming' || phase === 'active';
    };

    const upcomingSessions =
      soloSessions.filter(s => isSessionUpcoming(s)).length +
      groupSessions.filter(g => isSessionUpcoming(g)).length;

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
