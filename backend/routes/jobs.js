const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  getJobs,
  getJobById,
  createJob,
  applyForJob,
  getMyApplications
} = require('../controllers/jobController');

router.get('/', optionalAuth, getJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/:id', getJobById);
router.post('/', protect, authorize('alumni', 'admin'), createJob);
router.post('/:id/apply', protect, authorize('student', 'alumni'), applyForJob);

module.exports = router;