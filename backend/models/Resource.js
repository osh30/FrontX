const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  targetAudience: [{ type: String }],
  tags: [{ type: String }],
  uploadType: { type: String, enum: ['File', 'ExternalLink'], required: true },
  fileUrl: { type: String, default: null },
  fileType: { type: String, default: null },
  fileSize: { type: String, default: null },
  externalLink: { type: String, default: null },
  readingTime: { type: String },
  isFeatured: { type: Boolean, default: false },
  whyUse: { type: String, required: true },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
