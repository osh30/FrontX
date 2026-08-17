const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const CollaborationPost = require('../models/CollaborationPost');

// @desc    Get public aggregate stats for landing page
// @route   GET /api/stats/public
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const [students, alumni, researchOpportunities, careerOpportunities] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      CollaborationPost.countDocuments({ status: { $ne: 'closed' } }),
      Opportunity.countDocuments({ status: { $in: ['approved', 'active'] } })
    ]);

    res.json({
      students,
      alumni,
      researchOpportunities,
      careerOpportunities
    });
  } catch (error) {
    console.error('Public stats endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
