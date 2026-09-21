const express = require('express');
const router = express.Router();
const { getCareerGrowth } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// GET /api/analytics/career-growth - Returns authenticated student's monthly activity trend
router.get('/career-growth', protect, getCareerGrowth);

module.exports = router;
