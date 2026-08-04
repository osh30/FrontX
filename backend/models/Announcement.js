const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['one-on-one', 'group'],
    default: 'one-on-one'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  attachments: [{
    name: String,
    url: String,
    type: { type: String, enum: ['pdf', 'ppt', 'docx', 'link', 'image', 'other'] }
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
