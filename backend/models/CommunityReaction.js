const mongoose = require('mongoose');

const communityReactionSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Like', 'Love', 'Support', 'Insightful'],
    required: true,
    default: 'Like'
  }
}, {
  timestamps: true
});

// A user can only react to a post once (they can change it, but only one reaction type exists per user per post)
communityReactionSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('CommunityReaction', communityReactionSchema);
