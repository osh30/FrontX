const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  getAlumniPosts,
  getPostById,
  updatePost,
  deletePost,
  applyForPost,
  getPostApplications,
  getMyApplication,
  updateApplicationStatus
} = require('../controllers/collaborationController');

// All routes are protected
router.use(protect);

router.post('/', createPost);
router.get('/', getPosts);
router.get('/alumni', getAlumniPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/apply', applyForPost);
router.get('/:id/applications', getPostApplications);
router.get('/:id/my-application', getMyApplication);
router.put('/applications/:appId/status', updateApplicationStatus);

module.exports = router;
