const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview,
  getCompanyReviews,
  getMyReviews,
  getMyCompanyReview,
  updateReview,
  deleteReview,
  getRecruiterReviews,
  getCompanyReviewStats,
} = require('../controllers/companyReviewController');

router.use(protect);

router.post('/', createReview);
router.get('/company/:companyId', getCompanyReviews);
router.get('/company/:companyId/stats', getCompanyReviewStats);
router.get('/company/:companyId/my-review', getMyCompanyReview);
router.get('/my-reviews', getMyReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.get('/recruiter/reviews', getRecruiterReviews);

module.exports = router;
