const mongoose = require('mongoose');

const discussionQuestionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['one-on-one', 'group'],
    default: 'one-on-one'
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
  isResolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('DiscussionQuestion', discussionQuestionSchema);
