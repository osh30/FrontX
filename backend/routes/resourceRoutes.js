const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const communityResourceController = require('../controllers/communityResourceController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', protect, resourceController.getResources);
router.get('/community/all', protect, communityResourceController.getCommunityResources);
router.get('/saved', protect, resourceController.getSavedResources);
router.get('/continue-reading', protect, resourceController.getContinueReading);
router.get('/recommended', protect, resourceController.getRecommended);
router.get('/trending', protect, resourceController.getTrending);
router.get('/recently-uploaded', protect, resourceController.getRecentlyUploaded);
router.get('/most-downloaded', protect, resourceController.getMostDownloaded);
router.put('/community/:id/download', protect, communityResourceController.trackCommunityDownload);
router.put('/community/:id/view', protect, communityResourceController.trackCommunityView);
router.get('/:id', protect, resourceController.getResourceById);
router.post('/', protect, upload.single('file'), resourceController.createResource);
router.put('/:id/download', protect, resourceController.trackDownload);
router.put('/:id/bookmark', protect, resourceController.toggleBookmark);
router.put('/:id/rating', protect, resourceController.rateResource);
router.put('/:id/reading-progress', protect, resourceController.updateReadingProgress);
router.post('/:id/share', protect, resourceController.shareResource);
router.put('/:id', protect, resourceController.updateResource);
router.delete('/:id', protect, resourceController.deleteResource);

module.exports = router;
