const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStudentInterviews, getStudentInterviewById } = require('../controllers/studentInterviewController');

router.use(protect);

router.get('/', getStudentInterviews);
router.get('/:id', getStudentInterviewById);

module.exports = router;
