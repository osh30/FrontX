const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
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
    enum: ['Mentorship Session', 'Career Guidance', 'Research Discussion', 'Mock Interview', 'Portfolio Review', 'Resume Review', 'Scholarship Guidance', 'Custom'],
    required: true
  },
  meetingType: {
    type: String,
    enum: ['frontx', 'external'],
    default: 'frontx'
  },
  platform: {
    type: String,
    enum: ['Google Meet', 'Zoom', 'Microsoft Teams', 'Other'],
    default: 'Google Meet'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  roomId: {
    type: String,
    default: ''
  },
  goal: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  // Feedback fields
  feedbackStrengths: {
    type: String
  },
  feedbackImprovement: {
    type: String
  },
  feedbackNextSteps: {
    type: String
  },
  feedbackResources: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
