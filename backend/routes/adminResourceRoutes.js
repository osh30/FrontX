const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const {
  getAdminResources,
  getPublicResources,
  getMyResources,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
} = require('../controllers/adminResourceController');

// Public routes (students & alumni)
router.get('/public', optionalAuth, getPublicResources);
router.get('/:id/download', optionalAuth, downloadResource);

// Admin-only routes
router.get('/', protect, authorize('admin'), getAdminResources);

// Protected routes (admin + alumni)
router.get('/my/list', protect, getMyResources);
router.post('/', protect, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
