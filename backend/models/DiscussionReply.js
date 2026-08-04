const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionQuestion',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: { type: String, enum: ['pdf', 'ppt', 'docx', 'link', 'image', 'other'] }
  }],
  isPinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('DiscussionReply', discussionReplySchema);
