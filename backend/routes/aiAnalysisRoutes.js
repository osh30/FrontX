const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const aiAnalysisController = require('../controllers/aiAnalysisController');

router.get('/me', protect, aiAnalysisController.getAnalysis);
router.post('/generate', protect, aiAnalysisController.generateAnalysis);

module.exports = router;

