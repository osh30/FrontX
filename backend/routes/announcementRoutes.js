const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, togglePinAnnouncement
} = require('../controllers/announcementController');

router.post('/', protect, createAnnouncement);
router.get('/:sessionId/:sessionType', protect, getAnnouncements);
router.put('/:id', protect, updateAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);
router.put('/:id/pin', protect, togglePinAnnouncement);

module.exports = router;
