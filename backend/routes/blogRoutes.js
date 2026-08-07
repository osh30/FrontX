const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, protectAdmin, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

// Public / logged-in read endpoints (drafts are hidden from non-admins)
router.get('/', optionalAuth, blogController.getBlogs);
router.get('/saved', protect, blogController.getSavedBlogs);
router.get('/:id', optionalAuth, blogController.getBlogById);
router.get('/:id/recommended', optionalAuth, blogController.getRecommendedBlogs);

// Admin-only blog management endpoints
router.get('/admin/all', protectAdmin, blogController.getAdminBlogs);
router.put('/admin/:id', protectAdmin, blogController.updateBlog);
router.put('/admin/:id/status', protectAdmin, blogController.setBlogStatus);
router.delete('/admin/:id', protectAdmin, blogController.deleteBlog);
router.post('/upload', protectAdmin, upload.single('image'), blogController.uploadBlogImage);

// Author / community actions
router.post('/', protect, blogController.createBlog);
router.put('/:id', protect, blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);
router.post('/:id/like', protect, blogController.toggleLike);
router.post('/:id/bookmark', protect, blogController.toggleBookmark);
router.post('/:id/share', protect, blogController.shareBlog);
router.get('/:id/comments', optionalAuth, blogController.getComments);
router.post('/:id/comments', protect, blogController.addComment);
router.put('/:id/comments/:commentId', protect, blogController.updateComment);
router.delete('/:id/comments/:commentId', protect, blogController.deleteComment);
router.post('/:id/comments/:commentId/like', protect, blogController.toggleCommentLike);

module.exports = router;
