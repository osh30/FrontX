const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnonymousPost',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// A user can only like a post once
likeSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
