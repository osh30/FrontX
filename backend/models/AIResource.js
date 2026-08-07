const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topic: { type: String, default: '' },
  explanation: { type: String, default: '' }
}, { _id: false });

const bookSchema = new mongoose.Schema({
  id: { type: String, default: '' },
  title: { type: String, default: '' },
  authors: { type: [String], default: [] },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  infoLink: { type: String, default: '' },
  previewLink: { type: String, default: '' },
  averageRating: { type: Number, default: null },
  ratingCount: { type: Number, default: 0 },
  publisher: { type: String, default: '' },
  publishedDate: { type: String, default: '' },
  pageCount: { type: Number, default: null }
}, { _id: false });

const videoSchema = new mongoose.Schema({
  videoId: { type: String, default: '' },
  title: { type: String, default: '' },
  channelTitle: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  publishedAt: { type: Date, default: null },
  description: { type: String, default: '' }
}, { _id: false });

const statusSchema = new mongoose.Schema({
  topics: { type: String, default: 'fulfilled' },
  books: { type: String, default: 'fulfilled' },
  videos: { type: String, default: 'fulfilled' }
}, { _id: false });

const sectionErrorSchema = new mongoose.Schema({
  topics: { type: String, default: null },
  books: { type: String, default: null },
  videos: { type: String, default: null }
}, { _id: false });

const aiResourceSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  courseCode: { type: String, default: '' },
  courseName: { type: String, default: '' },
  topics: { type: [topicSchema], default: [] },
  books: { type: [bookSchema], default: [] },
  videos: { type: [videoSchema], default: [] },
  sectionsStatus: { type: statusSchema, default: () => ({}) },
  sectionErrors: { type: sectionErrorSchema, default: () => ({}) },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AIResource', aiResourceSchema);
