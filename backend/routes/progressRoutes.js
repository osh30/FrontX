const express = require('express');
const router = express.Router();
const { getProgress, refreshProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProgress);
router.get('/refresh', protect, refreshProgress);

module.exports = router;
