const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  publicId: { type: String, default: '' }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicantRole: {
    type: String,
    enum: ['student', 'alumni'],
    required: true
  },
  applicantName: { type: String, default: '' },
  applicantEmail: { type: String, default: '' },
  applicantDepartment: { type: String, default: '' },
  applicantStudentId: { type: String, default: '' },
  applicantSession: { type: String, default: '' },
  applicantGraduationYear: { type: String, default: '' },
  status: {
    type: String,
    enum: ['applied', 'pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'accepted'],
    default: 'applied'
  },
  phone: { type: String, default: '' },
  currentAddress: { type: String, default: '' },
  skills: [{ type: String }],
  languages: [{ type: String }],
  coverLetter: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  resumeFile: fileSchema,
  transcriptFile: { type: fileSchema, default: null },
  certificates: [fileSchema],
  portfolioFile: { type: fileSchema, default: null },
  notes: { type: String, default: '' },
  reviewedAt: { type: Date }
}, { timestamps: true });

applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });
applicationSchema.index({ recruiter: 1, createdAt: -1 });
applicationSchema.index({ recruiter: 1, status: 1 });
applicationSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
