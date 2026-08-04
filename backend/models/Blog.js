const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: null },
  category: {
    type: String,
    required: true,
    enum: [
      'Study Tips', 'Career', 'Internship', 'Research', 'Programming',
      'AI', 'Scholarship', 'Productivity', 'University Life',
      'Project Showcase', 'Success Story', 'Events', 'Technology', 'Others'
    ]
  },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['admin', 'alumni', 'student'], required: true },
  department: { type: String, default: '' },
  views: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  readingTime: { type: String, default: '1 min read' }
}, { timestamps: true });

blogSchema.index({ title: 'text', summary: 'text', tags: 'text' });
blogSchema.index({ category: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
