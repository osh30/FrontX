const mongoose = require('mongoose');

const companyReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerRole: {
    type: String,
    enum: ['student', 'alumni'],
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  opportunityTitle: {
    type: String,
    default: ''
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  reviewDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  wouldRecommend: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['visible', 'hidden', 'deleted'],
    default: 'visible'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

companyReviewSchema.index({ company: 1, status: 1, createdAt: -1 });
companyReviewSchema.index({ recruiter: 1, status: 1, createdAt: -1 });
companyReviewSchema.index({ reviewer: 1, company: 1 }, { unique: true });
companyReviewSchema.index({ overallRating: -1 });

module.exports = mongoose.model('CompanyReview', companyReviewSchema);
