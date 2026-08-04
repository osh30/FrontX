const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mentorship', 'collaboration', 'community', 'career', 'profile', 'system'],
    default: 'system'
  },
  color: {
    type: String,
    default: 'bg-blue-100 text-blue-600'
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  isGlobal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
