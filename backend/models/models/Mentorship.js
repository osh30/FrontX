const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'ongoing', 'completed', 'rejected'],
    default: 'pending'
  },
  requestMessage: String,
  topics: [String],
  preferredTime: String,
  sessions: [{
    date: Date,
    duration: Number,
    notes: String,
    attended: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  completedAt: Date
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);