const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const {
  createPost,
  getPosts,
  reactToPost,
  commentPost,
  savePost,
  resolvePost,
  deletePost,
  saveDraft,
  getDraft,
  deleteDraft,
  uploadFile,
  votePoll,
  getTrendingTopics,
  getActiveAlumni,
  getSuggestedDiscussions,
  getAnnouncements
} = require('../controllers/communityPostController');

// Draft routes must come BEFORE /:id routes to avoid param capture
router.put('/draft', protect, saveDraft);
router.get('/draft', protect, getDraft);
router.delete('/draft', protect, deleteDraft);

router.post('/upload', protect, upload.single('file'), uploadFile);

router.get('/trending-topics', protect, getTrendingTopics);
router.get('/active-alumni', protect, getActiveAlumni);
router.get('/suggested', protect, getSuggestedDiscussions);
router.get('/announcements', protect, getAnnouncements);

router.route('/')
  .post(protect, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]), createPost)
  .get(protect, getPosts);

router.put('/:id/react', protect, reactToPost);
router.post('/:id/comments', protect, commentPost);
router.put('/:id/save', protect, savePost);
router.put('/:id/resolve', protect, resolvePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/vote', protect, votePoll);

module.exports = router;
