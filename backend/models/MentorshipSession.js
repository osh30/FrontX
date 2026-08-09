const mongoose = require('mongoose');

const mentorshipSessionSchema = new mongoose.Schema({
  sessionTitle: {
    type: String,
    required: true
  },
  sessionCategory: {
    type: String,
    enum: [
      'Career Guidance', 
      'CV Review', 
      'Interview Preparation', 
      'Research Discussion', 
      'Industry Insights', 
      'Project Review', 
      'Scholarship Guidance', 
      'Graduate Study Guidance', 
      'Other'
    ],
    required: true
  },
  sessionDescription: {
    type: String,
    required: true
  },
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selectedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  meetingType: {
    type: String,
    enum: ['frontx', 'external'],
    default: 'frontx'
  },
  meetingPlatform: {
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
  sessionDate: {
    type: Date,
    required: true
  },
  sessionTime: {
    type: String,
    required: true
  },
  sessionDuration: {
    type: Number, // duration in minutes
    required: true
  },
  agenda: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Active', 'Completed', 'Cancelled', 'Past Session'],
    default: 'Upcoming'
  },
  scheduleStart: {
    type: Date,
    default: null
  },
  scheduleEnd: {
    type: Date,
    default: null
  },
  hasStarted: {
    type: Boolean,
    default: false
  },
  firstJoinedAt: {
    type: Date,
    default: null
  },
  // Sub-documents / Array of objects for attendance
  attendance: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Pending'],
      default: 'Pending'
    }
  }],
  outcome: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorshipSession', mentorshipSessionSchema);
