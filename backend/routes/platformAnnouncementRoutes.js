const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPublicAnnouncements } = require('../controllers/adminAnnouncementController');

router.get('/', protect, getPublicAnnouncements);

module.exports = router;
