const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const MentorshipRequest = require('../models/MentorshipRequest');
const Session = require('../models/Session');
const MentorshipSession = require('../models/MentorshipSession');
const Resource = require('../models/Resource');
const analyticsController = require('../controllers/analyticsController');

// GET /api/alumni/analytics/dashboard
router.get('/analytics/dashboard', protect, analyticsController.getAlumniAnalytics);
router.get('/stats', protect, async (req, res) => {
  try {
    const alumniId = req.user.id;
    
    // Total Students Mentored (unique students whose requests are accepted)
    const uniqueStudents = await MentorshipRequest.distinct('studentId', { alumniId, status: 'accepted' });
    const totalStudentsMentored = uniqueStudents.length;
    
    // Active Mentorships (all accepted requests)
    const activeMentorships = await MentorshipRequest.countDocuments({ alumniId, status: 'accepted' });
    
    // Upcoming Sessions (1-on-1)
    const upcomingSoloSessions = await Session.countDocuments({ 
      alumni: alumniId, 
      date: { $gt: new Date() },
      status: { $in: ['Scheduled', 'Upcoming'] }
    });

    // Upcoming Sessions (group mentorship)
    const upcomingGroupSessions = await MentorshipSession.countDocuments({ 
      alumniId: alumniId, 
      sessionDate: { $gt: new Date() },
      status: { $in: ['Upcoming'] }
    });

    const upcomingSessions = upcomingSoloSessions + upcomingGroupSessions;
    
    // Resources Shared
    const resourcesShared = await Resource.countDocuments({ alumniId });

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
