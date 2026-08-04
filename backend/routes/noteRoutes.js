const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const noteController = require('../controllers/noteController');

router.get('/filters/meta', protect, noteController.getFilterMeta);
router.get('/student/:id', protect, noteController.getNotesByStudent);
router.get('/', protect, noteController.getAllNotes);
router.post('/', protect, upload.single('file'), noteController.createNote);
router.get('/:id', protect, noteController.getNoteById);
router.post('/:id/view', protect, noteController.incrementViews);
router.post('/:id/download', protect, noteController.incrementDownloads);
router.delete('/:id', protect, noteController.deleteNote);

module.exports = router;
