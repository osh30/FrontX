const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDeadlines } = require('../controllers/deadlineController');

router.get('/', protect, getDeadlines);

module.exports = router;
