const CompanyReview = require('../models/CompanyReview');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'student' && role !== 'alumni') {
      return res.status(403).json({ message: 'Only students and alumni can submit reviews' });
    }

    const { companyId, opportunityId, overallRating, reviewTitle, reviewDescription, wouldRecommend } = req.body;

    if (!companyId || !opportunityId || !overallRating || !reviewTitle || !reviewDescription) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (reviewTitle.length > 200) {
      return res.status(400).json({ message: 'Review title cannot exceed 200 characters' });
    }

    if (reviewDescription.length > 2000) {
      return res.status(400).json({ message: 'Review description cannot exceed 2000 characters' });
    }

    const opportunity = await Opportunity.findById(opportunityId).lean();
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const recruiterId = opportunity.recruiter;

    const existing = await CompanyReview.findOne({
      reviewer: userId,
      company: companyId,
      status: { $ne: 'deleted' }
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this company' });
    }

    const interviewerName = await User.findById(recruiterId).select('name companyName').lean();

    const review = await CompanyReview.create({
      reviewer: userId,
      reviewerRole: role,
      recruiter: recruiterId,
      company: companyId,
      opportunity: opportunityId,
      opportunityTitle: opportunity.title,
      companyName: opportunity.companyName || interviewerName?.companyName || 'Unknown Company',
      overallRating: Math.round(overallRating),
      reviewTitle: reviewTitle.trim(),
      reviewDescription: reviewDescription.trim(),
      wouldRecommend: !!wouldRecommend,
      status: 'visible'
    });

    try {
      await Notification.create({
        user: recruiterId,
        senderUserId: userId,
        title: 'New Company Review Received',
        message: `A ${role === 'student' ? 'Student' : 'Alumni'} has submitted a review for your company.`,
        type: 'application',
        relatedId: review._id
      });
    } catch (notifErr) {
      console.error('Notification creation failed (non-blocking):', notifErr.message);
    }

    const populated = await CompanyReview.findById(review._id)
      .populate('reviewer', 'name profilePicture department graduationYear')
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this company' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, rating, sort = 'latest' } = req.query;

    const query = { company: companyId, status: 'visible' };
    if (rating && rating !== 'all') {
      query.overallRating = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { overallRating: -1, createdAt: -1 };
    else if (sort === 'lowest') sortOption = { overallRating: 1, createdAt: -1 };

    const [reviews, total] = await Promise.all([
      CompanyReview.find(query)
        .populate('reviewer', 'name profilePicture department graduationYear')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CompanyReview.countDocuments(query)
    ]);

    res.json({ reviews, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get company reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCompanyReviewStats = async (req, res) => {
  try {
    const { companyId } = req.params;

    const stats = await CompanyReview.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId), status: 'visible' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 },
          recommendCount: { $sum: { $cond: ['$wouldRecommend', 1, 0] } }
        }
      }
    ]);

    const summary = stats[0] || { avgRating: 0, totalReviews: 0, recommendCount: 0 };
    summary.avgRating = Math.round((summary.avgRating || 0) * 10) / 10;
    summary.recommendPercent = summary.totalReviews > 0
      ? Math.round((summary.recommendCount / summary.totalReviews) * 100)
      : 0;

    res.json(summary);
  } catch (error) {
    console.error('Get company review stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await CompanyReview.find({ reviewer: req.user.id, status: { $ne: 'deleted' } })
      .populate('reviewer', 'name profilePicture department graduationYear')
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await CompanyReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    const { overallRating, reviewTitle, reviewDescription, wouldRecommend } = req.body;

    if (reviewTitle !== undefined) {
      if (reviewTitle.length > 200) return res.status(400).json({ message: 'Review title cannot exceed 200 characters' });
      review.reviewTitle = reviewTitle.trim();
    }

    if (reviewDescription !== undefined) {
      if (reviewDescription.length > 2000) return res.status(400).json({ message: 'Review description cannot exceed 2000 characters' });
      review.reviewDescription = reviewDescription.trim();
    }

    if (overallRating !== undefined) {
      if (overallRating < 1 || overallRating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      review.overallRating = Math.round(overallRating);
    }

    if (wouldRecommend !== undefined) review.wouldRecommend = !!wouldRecommend;

    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();

    const populated = await CompanyReview.findById(review._id)
      .populate('reviewer', 'name profilePicture department graduationYear')
      .lean();

    res.json(populated);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await CompanyReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    review.status = 'deleted';
    await review.save();

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecruiterReviews = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { rating, search, sort = 'latest', page = 1, limit = 20 } = req.query;

    const query = { recruiter: req.user.id, status: 'visible' };
    if (rating && rating !== 'all') {
      query.overallRating = parseInt(rating);
    }
    if (search) {
      query.$or = [
        { reviewTitle: { $regex: search, $options: 'i' } },
        { reviewDescription: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { overallRating: -1, createdAt: -1 };
    else if (sort === 'lowest') sortOption = { overallRating: 1, createdAt: -1 };

    const [reviews, total] = await Promise.all([
      CompanyReview.find(query)
        .populate('reviewer', 'name profilePicture department graduationYear')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CompanyReview.countDocuments(query)
    ]);

    const stats = await CompanyReview.aggregate([
      { $match: { recruiter: new mongoose.Types.ObjectId(req.user.id), status: 'visible' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 },
          recommendCount: { $sum: { $cond: ['$wouldRecommend', 1, 0] } }
        }
      }
    ]);

    const summary = stats[0] || { avgRating: 0, totalReviews: 0, recommendCount: 0 };
    summary.avgRating = Math.round((summary.avgRating || 0) * 10) / 10;
    summary.recommendPercent = summary.totalReviews > 0
      ? Math.round((summary.recommendCount / summary.totalReviews) * 100)
      : 0;

    res.json({ reviews, summary, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get recruiter reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyCompanyReview = async (req, res) => {
  try {
    const { companyId } = req.params;
    const review = await CompanyReview.findOne({
      reviewer: req.user.id,
      company: companyId,
      status: { $ne: 'deleted' }
    }).populate('reviewer', 'name profilePicture department graduationYear').lean();

    res.json({ review });
  } catch (error) {
    console.error('Get my company review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getCompanyReviews,
  getCompanyReviewStats,
  getMyReviews,
  getMyCompanyReview,
  updateReview,
  deleteReview,
  getRecruiterReviews
};
