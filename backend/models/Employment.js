const mongoose = require('mongoose');

const employmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  companyName: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    default: 0
  },
  salaryCurrency: {
    type: String,
    default: 'BDT'
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Internship', 'Contract', 'Remote'],
    default: 'Full-Time'
  },
  joiningDate: {
    type: Date
  },
  workLocation: {
    type: String,
    default: ''
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

employmentSchema.index({ student: 1 });
employmentSchema.index({ recruiter: 1 });
employmentSchema.index({ companyName: 1 });
employmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Employment', employmentSchema);
