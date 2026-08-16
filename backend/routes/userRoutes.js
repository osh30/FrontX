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
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.put('/theme', protect, updateTheme);

router.get('/:id', protect, getUserById);

module.exports = router;
