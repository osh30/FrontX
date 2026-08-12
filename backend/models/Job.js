const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required']
  },
  company: {
    type: String,
    required: [true, 'Company name is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  requirements: [String],
  location: String,
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'BDT' }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'remote', 'hybrid'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'entry'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    coverLetter: String,
    resume: String
  }],
  linkedOpportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  opportunityType: {
    type: String,
    enum: ['Government Job', 'Private Job', 'Internship', 'Remote Job', 'Part-Time Job', 'Scholarship', 'Competition', 'full-time'],
    default: 'Private Job'
  },
  applicationUrl: {
    type: String,
    default: ''
  },
  eligibility: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);