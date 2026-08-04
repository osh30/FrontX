const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/auth');
const {
  getStats,
  getCommunityPosts,
  adminDeletePost,
  adminDeleteComment,
  getAllUsers,
  adminDeleteUser,
  adminUpdateUserRole,
} = require('../controllers/adminController');

const {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getPendingOpportunities,
  getOpportunityRequestById,
  approveOpportunity,
  rejectOpportunity,
} = require('../controllers/adminOpportunityController');

const {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
} = require('../controllers/adminAnnouncementController');

const {
  getAnalytics,
  getAnalyticsUsers,
  getAnalyticsCommunity,
  getAnalyticsBlogs,
  getAnalyticsResources,
  getAnalyticsOpportunities,
  getAnalyticsStudyPlanner,
  getAnalyticsMentorship,
  getAnalyticsCollaboration,
  getAnalyticsNotifications,
  getAnalyticsAnnouncements,
} = require('../controllers/adminAnalyticsController');

const {
  getPlacementOverview,
  getPlacementCharts,
  getDepartmentPlacement,
  getTopCompanies,
  getSalaryStats,
} = require('../controllers/adminPlacementController');

const {
  getAllReviews,
  hideReview,
  restoreReview,
  deleteReview,
} = require('../controllers/adminReviewController');

router.use(protectAdmin);

router.get('/stats', getStats);

router.get('/community-posts', getCommunityPosts);
router.delete('/community-posts/:id', adminDeletePost);
router.delete('/community-posts/:postId/comments/:commentId', adminDeleteComment);

router.get('/users', getAllUsers);
router.delete('/users/:id', adminDeleteUser);
router.put('/users/:id/role', adminUpdateUserRole);

router.get('/opportunities', getOpportunities);
router.post('/opportunities', createOpportunity);
router.put('/opportunities/:id', updateOpportunity);
router.delete('/opportunities/:id', deleteOpportunity);

// ─── Opportunity Requests (Approval Workflow) ───
router.get('/opportunity-requests', getPendingOpportunities);
router.get('/opportunity-requests/:id', getOpportunityRequestById);
router.put('/opportunity-requests/:id/approve', approveOpportunity);
router.put('/opportunity-requests/:id/reject', rejectOpportunity);

router.get('/announcements', getAdminAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);
router.put('/announcements/:id/pin', togglePin);

router.get('/analytics', getAnalytics);
router.get('/analytics/users', getAnalyticsUsers);
router.get('/analytics/community', getAnalyticsCommunity);
router.get('/analytics/blogs', getAnalyticsBlogs);
router.get('/analytics/resources', getAnalyticsResources);
router.get('/analytics/opportunities', getAnalyticsOpportunities);
router.get('/analytics/study-planner', getAnalyticsStudyPlanner);
router.get('/analytics/mentorship', getAnalyticsMentorship);
router.get('/analytics/collaboration', getAnalyticsCollaboration);
router.get('/analytics/notifications', getAnalyticsNotifications);
router.get('/analytics/announcements', getAnalyticsAnnouncements);

router.get('/placement', getPlacementOverview);
router.get('/placement/charts', getPlacementCharts);
router.get('/placement/departments', getDepartmentPlacement);
router.get('/placement/top-companies', getTopCompanies);
router.get('/placement/salary', getSalaryStats);

router.get('/company-reviews', getAllReviews);
router.patch('/company-reviews/:id/hide', hideReview);
router.patch('/company-reviews/:id/restore', restoreReview);
router.delete('/company-reviews/:id', deleteReview);

module.exports = router;
