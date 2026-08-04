const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const controller = require('../controllers/studyPlannerController');

router.get('/', protect, controller.getPlanner);
router.get('/marks', protect, controller.getMarkDistribution);
router.get('/grades/:credit', protect, controller.getGradeTable);
router.get('/stats', protect, controller.getStats);
router.post('/setup', protect, controller.saveSetup);
router.post('/courses/:courseId/outline', protect, upload.single('file'), controller.uploadOutline);
router.post('/courses/:courseId/weeks/:weekId/note', protect, upload.single('file'), controller.uploadWeekNote);
router.post('/reminders', protect, controller.generateReminders);

module.exports = router;
