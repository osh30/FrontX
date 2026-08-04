const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  companyName: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
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
    type: Number,
    default: 30
  },
  interviewType: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online'
  },
  meetingType: {
    type: String,
    enum: ['frontx', 'external'],
    default: 'frontx'
  },
  platform: {
    type: String,
    enum: ['Google Meet', 'Zoom', 'Microsoft Teams', 'FrontX Video', 'Phone', 'In-Person', 'Other'],
    default: 'FrontX Video'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  roomId: {
    type: String,
    default: ''
  },
  interviewLocation: {
    type: String,
    default: ''
  },
  panelMembers: [{
    name: String,
    role: { type: String, default: '' }
  }],
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  previousDate: Date,
  previousTime: String,
  cancelReason: {
    type: String,
    default: ''
  },
  feedback: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  calendarEventId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

interviewSchema.index({ recruiter: 1, date: 1 });
interviewSchema.index({ student: 1, date: 1 });
interviewSchema.index({ recruiter: 1, status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
