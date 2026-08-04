const mongoose = require('mongoose');

const resourceBookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
  }
}, { timestamps: true });

// Prevent multiple bookmarks from the same user on the same resource
resourceBookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('ResourceBookmark', resourceBookmarkSchema);
