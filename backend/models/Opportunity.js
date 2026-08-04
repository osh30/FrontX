const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  opportunityType: {
    type: String,
    enum: ['Government Job', 'Private Job', 'Internship', 'Remote Job', 'Part-Time Job', 'Scholarship', 'Competition'],
    required: true
  },
  department: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  employmentMode: {
    type: String,
    enum: ['On-site', 'Hybrid', 'Remote'],
    default: 'On-site'
  },
  vacancies: {
    type: Number,
    default: 1
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'BDT' }
  },
  deadline: {
    type: Date
  },
  joiningDate: {
    type: Date
  },
  description: {
    about: { type: String, default: '' },
    responsibilities: { type: String, default: '' },
    requirements: { type: String, default: '' },
    benefits: { type: String, default: '' },
    additionalInfo: { type: String, default: '' }
  },
  eligibility: {
    minCgpa: { type: String, default: '' },
    eligibleDepartments: [{ type: String }],
    eligibleGraduationYears: [{ type: String }],
    experienceRequired: { type: String, default: '' },
    languageRequirements: [{ type: String }]
  },
  skills: [{ type: String }],
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  applicationMethod: {
    type: String,
    default: 'Inside FrontX'
  },
  visibility: {
    type: [String],
    enum: ['student', 'alumni'],
    default: ['student', 'alumni']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'pending', 'approved', 'rejected'],
    default: 'active'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  createdByRole: {
    type: String,
    enum: ['admin', 'recruiter'],
    default: 'recruiter'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

opportunitySchema.index({ recruiter: 1, createdAt: -1 });
opportunitySchema.index({ status: 1, createdAt: -1 });
opportunitySchema.index({ opportunityType: 1 });
opportunitySchema.index({ deadline: 1 });
opportunitySchema.index({ visibility: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
