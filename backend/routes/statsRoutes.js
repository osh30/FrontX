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

// @desc    Get public alumni list for landing page
// @route   GET /api/stats/alumni
// @access  Public
router.get('/alumni', async (req, res) => {
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

// @desc    Get public collaboration posts for landing page
// @route   GET /api/stats/collaboration
// @access  Public
router.get('/collaboration', async (req, res) => {
  try {
    const posts = await CollaborationPost.find({ status: 'active' })
      .populate({
        path: 'alumni',
        select: 'name role department'
      })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    const formatted = posts.map(p => ({
      _id: p._id,
      id: p._id,
      title: p.title,
      type: p.type || p.domain || 'Research Project',
      domain: p.domain || 'Technology',
      mentor: p.alumni?.name || 'Alumni Mentor',
      deadline: p.deadline,
      status: p.status || 'active'
    }));

    res.json({ success: true, posts: formatted });
  } catch (error) {
    console.error('Public collaboration posts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public collaboration posts' });
  }
});

// @desc    Get public selected career opportunities for landing page
// @route   GET /api/stats/opportunities
// @access  Public
router.get('/opportunities', async (req, res) => {
  try {
    const targetTitles = [
      "Digital Technology Intern",
      "UX Research Intern",
      "Junior Product Analyst"
    ];

    const foundOpps = await Opportunity.find({
      title: { $in: targetTitles }
    }).select('title company companyName role').lean();

    const formatted = foundOpps.map(o => ({
      id: o._id,
      _id: o._id,
      role: o.title,
      company: o.company || o.companyName || 'Corporate Partner'
    }));

    res.json({ success: true, opportunities: formatted });
  } catch (error) {
    console.error('Public opportunities endpoint error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public opportunities' });
  }
});

module.exports = router;
