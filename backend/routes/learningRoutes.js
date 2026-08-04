const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

// Get all learning items
router.get('/', protect, learningController.getLearnings);

// Get single learning item
router.get('/:id', protect, learningController.getLearning);

// Create a new learning item
router.post('/', protect, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), learningController.createLearning);

module.exports = router;
