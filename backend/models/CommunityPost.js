const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { _id: true });

const communityPostSchema = new mongoose.Schema({
  originalAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  title: { type: String, default: '' },
  content: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: null },
  documentUrl: { type: String, default: null },
  documentName: { type: String, default: null },
  tags: [{ type: String }],
  allowComments: { type: Boolean, default: true },
  poll: {
    options: [pollOptionSchema],
    expiresAt: { type: Date, default: null }
  },
  resolvedStatus: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
