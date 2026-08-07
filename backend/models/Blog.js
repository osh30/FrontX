const mongoose = require('mongoose');

const BLOG_CATEGORIES = [
  'Study Tips', 'Career', 'Internship', 'Research', 'Programming',
  'AI', 'Scholarship', 'Productivity', 'University Life',
  'Project Showcase', 'Success Story', 'Events', 'Technology', 'Others'
];

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'heading', 'paragraph', 'image', 'quote', 'tip', 'facts',
      'checklist', 'numberedSteps', 'timeline', 'comparisonTable', 'faq', 'divider'
    ]
  },
  level: { type: Number, default: 2, min: 1, max: 3 },
  heading: { type: String, default: '' },
  text: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  caption: { type: String, default: '' },
  alt: { type: String, default: '' },
  quote: { type: String, default: '' },
  source: { type: String, default: '' },
  tip: { type: String, default: '' },
  facts: [{ type: String }],
  items: [{ type: String }],
  timeline: [{ title: { type: String, default: '' }, description: { type: String, default: '' } }],
  headers: [{ type: String }],
  rows: [[{ type: String }]],
  qa: [{ question: { type: String, default: '' }, answer: { type: String, default: '' } }]
}, { _id: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  summary: { type: String, required: true },
  content: { type: String, default: '' },
  contentJson: { type: mongoose.Schema.Types.Mixed, default: null },
  coverImage: { type: String, default: null },
  heroImage: { type: String, default: null },
  category: {
    type: String,
    required: true,
    enum: BLOG_CATEGORIES
  },
  tags: [{ type: String }],
  sections: { type: [sectionSchema], default: [] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['admin', 'alumni', 'student'], required: true },
  department: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  featured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
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
blogSchema.index({ status: 1 });
blogSchema.index({ featured: 1, createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
module.exports.BLOG_CATEGORIES = BLOG_CATEGORIES;
