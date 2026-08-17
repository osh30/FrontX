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

// Public unauthenticated route for landing page
router.get('/public', async (req, res) => {
  try {
    const CollaborationPost = require('../models/CollaborationPost');
    const posts = await CollaborationPost.find({ status: 'active' })
      .populate({
        path: 'alumni',
        select: 'name role department'
      })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    const formatted = posts.map(p => ({
      _id: p._id,
      id: p._id,
      title: p.title,
      type: p.type || p.domain || 'Research Project',
      domain: p.domain || 'Technology',
      mentor: p.alumni?.name || 'Alumni Mentor',
      deadline: p.deadline,
      status: p.status || 'active'
    }));

    res.json({ success: true, posts: formatted });
  } catch (error) {
    console.error('Public collaboration posts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public collaboration posts' });
  }
});

// All subsequent routes are protected
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
