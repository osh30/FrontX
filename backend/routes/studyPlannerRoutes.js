const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const controller = require('../controllers/studyPlannerController');
const aiResourceController = require('../controllers/aiResourceController');

router.get('/', protect, controller.getPlanner);
router.get('/marks', protect, controller.getMarkDistribution);
router.get('/grades/:credit', protect, controller.getGradeTable);
router.get('/stats', protect, controller.getStats);
router.post('/setup', protect, controller.saveSetup);
router.post('/courses', protect, controller.addCourse);
router.delete('/courses/:courseId', protect, controller.deleteCourse);
router.post('/courses/:courseId/outline', protect, upload.single('file'), controller.uploadOutline);
router.post('/courses/:courseId/weeks/:weekId/note', protect, upload.single('file'), controller.uploadWeekNote);
router.post('/reminders', protect, controller.generateReminders);
router.get('/courses/:courseId/ai-resources', protect, aiResourceController.getCourseResources);

// Academic Calendar Routes
router.get('/calendars', protect, controller.getAcademicCalendars);
router.post('/calendars', protect, controller.publishAcademicCalendar);
router.post('/calendars/parse-pdf', protect, upload.single('file'), controller.parseAcademicCalendarPdf);
router.delete('/calendars/:id', protect, controller.deleteAcademicCalendar);

module.exports = router;

