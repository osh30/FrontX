const mongoose = require('mongoose');

const recommendedLearningSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Book', 'Article', 'Research Paper', 'Guide', 'Report', 'Other'],
    required: true,
  },
  coverImage: {
    type: String,
    default: null,
  },
  fileUrl: {
    type: String,
    default: null,
  },
  externalLink: {
    type: String,
    default: null,
  },
  tags: {
    type: [String],
    default: [],
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('RecommendedLearning', recommendedLearningSchema);
