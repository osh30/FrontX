const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, uploadFile, removeProfilePicture, getMentors, getStudents, getRecruiters, getUserById, changePassword, deleteAccount, updateTheme, sendRecruiterEmail } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/public-stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Opportunity = require('../models/Opportunity');
    const CollaborationPost = require('../models/CollaborationPost');

    const [students, alumni, researchOpportunities, careerOpportunities] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      CollaborationPost.countDocuments({ status: { $ne: 'closed' } }),
      Opportunity.countDocuments({ status: { $in: ['approved', 'active'] } })
    ]);

    res.json({ students, alumni, researchOpportunities, careerOpportunities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public-alumni', async (req, res) => {
  try {
    const User = require('../models/User');
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

router.get('/public-collaboration', async (req, res) => {
  try {
    const CollaborationPost = require('../models/CollaborationPost');
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

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/upload', protect, upload.single('file'), uploadFile);
router.delete('/profile-picture', protect, removeProfilePicture);

router.get('/mentors', protect, getMentors);
router.get('/students', protect, getStudents);
router.get('/recruiters', protect, getRecruiters);
router.post('/send-recruiter-email', protect, sendRecruiterEmail);

router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.put('/theme', protect, updateTheme);

router.get('/:id', protect, getUserById);

module.exports = router;
