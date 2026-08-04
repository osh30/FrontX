const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['mentorship', 'collaboration', 'career', 'system'],
    default: 'system'
  },
  relatedId: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});

module.exports = mongoose.model('Deadline', deadlineSchema);
