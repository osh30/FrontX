const CompanyReview = require('../models/CompanyReview');
const Notification = require('../models/Notification');

const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { reviewTitle: { $regex: search, $options: 'i' } },
        { reviewDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total] = await Promise.all([
      CompanyReview.find(query)
        .populate('reviewer', 'name email')
        .populate('recruiter', 'name companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CompanyReview.countDocuments(query)
    ]);

    res.json({ reviews, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const hideReview = async (req, res) => {
  try {
    const review = await CompanyReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = 'hidden';
    await review.save();

    try {
      await Notification.create({
        user: review.reviewer,
        senderUserId: req.user.id,
        title: 'Review Hidden',
        message: 'Your company review has been hidden by an administrator for moderation.',
        type: 'system',
        relatedId: review._id
      });
    } catch (e) { /* non-blocking */ }

    res.json(review);
  } catch (error) {
    console.error('Hide review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const restoreReview = async (req, res) => {
  try {
    const review = await CompanyReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = 'visible';
    await review.save();

    try {
      await Notification.create({
        user: review.reviewer,
        senderUserId: req.user.id,
        title: 'Review Restored',
        message: 'Your company review has been restored by an administrator.',
        type: 'system',
        relatedId: review._id
      });
    } catch (e) { /* non-blocking */ }

    res.json(review);
  } catch (error) {
    console.error('Restore review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await CompanyReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = 'deleted';
    await review.save();

    try {
      await Notification.create({
        user: review.reviewer,
        senderUserId: req.user.id,
        title: 'Review Removed',
        message: 'Your company review has been removed by an administrator for policy violation.',
        type: 'system',
        relatedId: review._id
      });
    } catch (e) { /* non-blocking */ }

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllReviews, hideReview, restoreReview, deleteReview };
