const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createMentorshipSession,
  getMentorshipSessions,
  getMentorshipSessionById,
  getAcceptedStudents,
  submitSessionOutcome,
  cancelSession
} = require('../controllers/mentorshipSessionController');

router.post('/', protect, createMentorshipSession);
router.get('/', protect, getMentorshipSessions);
router.get('/accepted-students', protect, getAcceptedStudents);
router.get('/:id', protect, getMentorshipSessionById);
router.put('/:id/outcome', protect, submitSessionOutcome);
router.put('/:id/cancel', protect, cancelSession);

module.exports = router;
