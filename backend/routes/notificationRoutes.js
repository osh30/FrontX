const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(protect);

router.get('/', getUserNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

