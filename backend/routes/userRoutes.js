const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, uploadFile, removeProfilePicture, getMentors, getStudents, getRecruiters, getUserById, changePassword, deleteAccount, updateTheme, sendRecruiterEmail } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/upload', protect, upload.single('file'), uploadFile);
router.delete('/profile-picture', protect, removeProfilePicture);

router.get('/mentors', protect, getMentors);
router.get('/students', protect, getStudents);
router.get('/recruiters', protect, getRecruiters);
router.post('/send-recruiter-email', protect, sendRecruiterEmail);
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

router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.put('/theme', protect, updateTheme);

router.get('/:id', protect, getUserById);

module.exports = router;
