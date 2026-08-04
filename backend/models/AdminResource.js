const mongoose = require('mongoose');

const adminResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Resume Guide', 'Interview Preparation', 'Career Development',
      'Programming', 'Research', 'Academic Notes', 'Study Material',
      'Soft Skills', 'Portfolio Guide', 'Other'
    ]
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    required: [true, 'Detailed description is required']
  },
  department: {
    type: String,
    default: 'Educational Technology and Engineering'
  },
  resourceType: {
    type: String,
    default: 'PDF',
    enum: ['PDF']
  },
  pdfUrl: {
    type: String,
    required: [true, 'PDF URL is required']
  },
  coverImage: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedByRole: {
    type: String,
    enum: ['admin', 'alumni'],
    default: 'admin'
  },
  downloadsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

adminResourceSchema.index({ category: 1 });
adminResourceSchema.index({ status: 1 });
adminResourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminResource', adminResourceSchema);
