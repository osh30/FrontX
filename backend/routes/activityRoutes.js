const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getActivities, getGlobalActivities } = require('../controllers/activityController');

router.get('/global', getGlobalActivities);
router.get('/', protect, getActivities);

module.exports = router;
