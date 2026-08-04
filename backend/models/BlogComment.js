const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['admin', 'alumni', 'student'], required: true },
  content: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 }
}, { timestamps: true });

blogCommentSchema.index({ blog: 1, createdAt: -1 });

module.exports = mongoose.model('BlogComment', blogCommentSchema);
