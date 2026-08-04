const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

router.get('/', protect, blogController.getBlogs);
router.get('/saved', protect, blogController.getSavedBlogs);
router.get('/:id', protect, blogController.getBlogById);
router.get('/:id/recommended', protect, blogController.getRecommendedBlogs);
router.post('/', protect, blogController.createBlog);
router.put('/:id', protect, blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);
router.post('/:id/like', protect, blogController.toggleLike);
router.post('/:id/bookmark', protect, blogController.toggleBookmark);
router.post('/:id/share', protect, blogController.shareBlog);
router.get('/:id/comments', protect, blogController.getComments);
router.post('/:id/comments', protect, blogController.addComment);
router.put('/:id/comments/:commentId', protect, blogController.updateComment);
router.delete('/:id/comments/:commentId', protect, blogController.deleteComment);
router.post('/:id/comments/:commentId/like', protect, blogController.toggleCommentLike);

module.exports = router;
