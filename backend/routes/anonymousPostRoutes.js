const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const {
  createPost,
  getPosts,
  likePost,
  commentPost,
  savePost,
  resolvePost
} = require('../controllers/anonymousPostController');

router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(protect, getPosts);

router.put('/:id/like', protect, likePost);
router.post('/:id/comments', protect, commentPost);
router.put('/:id/save', protect, savePost);
router.put('/:id/resolve', protect, resolvePost);

module.exports = router;
